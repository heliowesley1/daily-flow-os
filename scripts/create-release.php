<?php
declare(strict_types=1);
// Run from the repository root, after npm run build:cpanel.
if (PHP_SAPI !== 'cli') exit(1);
function addFile(ZipArchive $zip, string $path, string $name): void {
    if (basename($path) === 'config.php' || basename($path) === '.env' || str_contains($path, '.test-runtime')) throw new RuntimeException('Arquivo privado recusado: '.$path);
    if (!is_file($path)) return;
    if (!$zip->addFile($path, str_replace('\\','/',$name))) throw new RuntimeException('Falha ao incluir '.$path);
}
function archive(string $name, array $files): void {
    $zip=new ZipArchive();
    if ($zip->open($name,ZipArchive::CREATE|ZipArchive::OVERWRITE)!==true) throw new RuntimeException('Falha ao criar ZIP');
    foreach($files as $entry=>$path)addFile($zip,$path,$entry);
    $zip->close();
    $check=new ZipArchive();
    if($check->open($name,ZipArchive::CHECKCONS)!==true)throw new RuntimeException('ZIP inválido');
    echo basename($name).': '.$check->numFiles.' arquivos, '.filesize($name)." bytes\n";
    $check->close();
}
$files=[];
foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator('release/web',FilesystemIterator::SKIP_DOTS)) as $item)if($item->isFile()){
    $path=str_replace('\\','/',$item->getPathname());$files[substr($path,strlen('release/'))]=$path;
}
$files['database.sql']='release/database.sql';$files['INSTALACAO.md']='release/INSTALACAO.md';
archive('release/daily-flow-cpanel.zip',$files);
$process=proc_open(['git','ls-files','-z','--cached','--others','--exclude-standard'],[1=>['pipe','w'],2=>['pipe','w']],$pipes);
$list=stream_get_contents($pipes[1]);fclose($pipes[1]);$errors=stream_get_contents($pipes[2]);fclose($pipes[2]);
if(proc_close($process)!==0)throw new RuntimeException($errors);
$source=[];foreach(explode("\0",$list) as $path)if($path!==''&&is_file($path))$source['daily-flow-os/'.$path]=$path;
archive('release/daily-flow-codigo-fonte.zip',$source);
$manifest=[];foreach(['daily-flow-cpanel.zip','daily-flow-codigo-fonte.zip','database.sql','INSTALACAO.md'] as $file)$manifest[$file]=['bytes'=>filesize('release/'.$file),'sha256'=>hash_file('sha256','release/'.$file)];
file_put_contents('release/SHA256.json',json_encode($manifest,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
echo "ZIPs verificados. Credenciais e dados de teste não foram incluídos.\n";
