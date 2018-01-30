//REQUIRE
var ftp = require("ftp-srv")
var createTorrent = require('create-torrent')
var WebTorrent = require('webtorrent')
var fs = require('fs')
var hbjs = require('handbrake-js')

//DEFINE VAR
var VideoTempDir =  __dirname + "/Video/Temp/"
var VideoFinalDir =  __dirname + "/Video/final/"
var TorrentFileDir =  __dirname + "/torrent/"
var TorrentClient = new WebTorrent()

console.log('-- ProjectTube Server --')

//INIT
var ftpServ = new ftp("ftp://127.0.0.1:250", {});
SeedAllTorrentFiles()

//FUNCTION SEED ALL FILE
function SeedAllTorrentFiles (){
    fs.readdir( TorrentFileDir , function( err, files ) {
        if (err){console.log(err)}
        files.forEach( function( file, index ) {
            SeedNewFile(file)
        })
        console.log("All files present on this node are seeding !")
    })
}
//FUNCTION NEW UPLOAD
ftpServ.on('login', ({connection, username, password}, resolve, reject) => {
    if (username != "root" && password != "root"){reject("auth")}
    resolve({root :VideoTempDir})
    connection.on('STOR', (err, file) => Transcode(file));
}) 

ftpServ.listen().then(() => {
    console.log("FTP server is running !")
});

function Transcode(file){   
    FinalFile = VideoFinalDir + file
    hbjs.spawn({ input: VideoTempDir + file, output: FinalFile , preset : "normal", encoder : "VP8"})
    .on('error', function(err){
        console.log(err)
    })
    .on('begin', function(){
        console.log(file + ' transcoding is starting... This operation can take up to 10min. If there are errors you will be wanted. Do not turn off server !')
    })
    .on('complete', function(){
        console.log('Transcoding for ' + file + " is ok.")
        GenerateTorrentFile(FinalFile , file)
    });
}

function GenerateTorrentFile(FinalFile, FileName){
    createTorrent(FinalFile, function (err, torrent) {
        if (!err) {
          fs.writeFile(TorrentFileDir + FileName + '.torrent', torrent)
          console.log("Torrent file is generate.")
          deleteTempFile(FileName)
          SeedNewFile(FileName + '.torrent')
        }
    })
}

function SeedNewFile(file){
    TorrentClient.seed(TorrentFileDir + file, function (torrent) {
        console.log(file + " file is now seeding !")
    })
}

function deleteTempFile(file){
    fs.unlink(VideoTempDir + file, function(){
        console.log("Temp files are now delete.")
    })
}