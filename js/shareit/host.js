// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536


function Host(db)
{
    connection.addEventListener('peer.connected', function(socket_id)
	{
		ui_peerstate("Peer connected!");

		db.sharepoints_getAll(null, transport._send_files_list)

		info(socket_id + " joined!");
	})

    connection.addEventListener('peer.disconnected', function(data)
	{
		ui_peerstate("Peer disconnected.");
	})

	// Peer

    this._transferbegin = function(file, onsuccess)
    {
        // Calc number of necesary chunks to download
        var chunks = file.size/chunksize;
        if(chunks % 1 != 0)
            chunks = Math.floor(chunks) + 1;

        // Add a blob container and a bitmap to our file stub
        file.blob = new Blob([''], {"type": file.type})
        file.bitmap = Bitmap(chunks)

        // Insert new "file" inside IndexedDB
        db.sharepoints_add(file,
        function(key)
        {
            if(onsuccess)
                onsuccess(chunks);

            console.log("Transfer begin: '"+key+"' = "+JSON.stringify(file))

            // Demand data from the begining of the file
            connection.emit('transfer.query', key, getRandom(file.bitmap))
        },
        function(errorCode)
        {
            console.error("Transfer begin: '"+file.name+"' is already in database.")
        })
    }
}