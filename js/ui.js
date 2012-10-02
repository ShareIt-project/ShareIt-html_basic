function oldBrowser()
{
    $('#Sharedpoints').html('Your browser is not modern enough to serve as a host. :(<br /><br />(Try Chrome or Firefox!)');
}

function _ui_filetype2className(filetype)
{
    filetype = filetype.split('/')

    switch(filetype[0])
    {
        case 'image':   return "image"
        case 'video':   return "video"
    }

    // Unknown file type, return generic file
    return "file"
}

function _ui_row_downloading(file)
{
    var tr = document.createElement('TR');

    var td = document.createElement('TD');
    tr.appendChild(td)

    // Name & icon
    var span = document.createElement('SPAN');
        span.className = _ui_filetype2className(file.type)
        span.appendChild(document.createTextNode(file.name));
    td.appendChild(span)

    // Type
    var td = document.createElement('TD');
        td.appendChild(document.createTextNode(file.type));
    tr.appendChild(td)

    // Size
    var td = document.createElement('TD');
        td.className="filesize"
        td.appendChild(document.createTextNode(humanize.filesize(file.size)));
    tr.appendChild(td)

    // Status
    var td = document.createElement('TD');
//        td.class = "end"
        td.appendChild(document.createTextNode("Paused"));
    tr.appendChild(td)

    return tr
}

function _ui_row_sharedpoints(file)
{
    var tr = document.createElement('TR');

    var td = document.createElement('TD');
    tr.appendChild(td)

    // Name & icon
    var span = document.createElement('SPAN');
        span.className = _ui_filetype2className(file.type)
        span.appendChild(document.createTextNode(file.name));
    td.appendChild(span)

    // Shared size
    var td = document.createElement('TD');
        td.className="filesize"
        td.appendChild(document.createTextNode(humanize.filesize(0)));
    tr.appendChild(td)

    var td = document.createElement('TD');
        td.class = "end"
    tr.appendChild(td)

    var a = document.createElement("A");
//        a.onclick = function()
//        {
//        }
        a.appendChild(document.createTextNode("Delete"));
    td.appendChild(a);

    return tr
}

function _ui_updatefiles(area, files, row_factory, button_factory)
{
    // Remove old table and add new empty one
    while(area.firstChild)
        area.removeChild(area.firstChild);

    for(var filename in files)
        if(files.hasOwnProperty(filename))
        {
            var file = files[filename]
            var path = ""
            if(file.path)
                path = file.path + '/';

            var tr = row_factory(file, button_factory)
                tr.id = path + file.name
                if(path)
                    tr.class = "child-of-" + path

            area.appendChild(tr)
        }
}

function ui_onopen(signaling, db)
{
    db.sharepoints_getAll(null, function(filelist)
    {
        signaling._send_files_list(filelist)

        ui_update_fileslist_downloading(filelist)

        // Restard downloads
        for(var i = 0, file; file = filelist[i]; i++)
            if(file.bitmap)
                signaling.emit('transfer.query',
                                file.name, getRandom(file.bitmap))
    })

    document.getElementById('files').addEventListener('change', function(event)
    {
        alert("change")
        var filelist = event.target.files; // FileList object

        // Loop through the FileList and append files to list.
        for(var i = 0, file; file = filelist[i]; i++)
            db.sharepoints_add(file)

        //signaling._send_files_list(filelist)   // Send just new files

        db.sharepoints_getAll(null, function(filelist)
        {
            signaling._send_files_list(filelist)

            ui_update_fileslist_downloading(filelist)
        })
    }, false);
}

function ui_setSignaling(signaling)
{
	function _button(file, hosting)
	{
	    var div = document.createElement("DIV");
	        div.id = file.name

	    div.transfer = function()
	    {
	        var transfer = document.createElement("A");
	            transfer.onclick = function()
	            {
	                peersManager._transferbegin(file);
	                return false;
	            }
	            transfer.appendChild(document.createTextNode("Transfer"));

	        while(div.firstChild)
	            div.removeChild(div.firstChild);
	        div.appendChild(transfer);
	    }
	    
	    div.progressbar = function()
	    {
	        var progress = document.createTextNode("0%")

	        while(div.firstChild)
	            div.removeChild(div.firstChild);
	        div.appendChild(progress);
	    }

	    div.open = function(blob)
	    {
	        var open = document.createElement("A");
	            open.href = window.URL.createObjectURL(blob)
	            open.target = "_blank"
	            open.appendChild(document.createTextNode("Open"));

	        while(div.firstChild)
	        {
	            window.URL.revokeObjectURL(div.firstChild.href);
	            div.removeChild(div.firstChild);
	        }
	        div.appendChild(open);
	    }

	    // Show if file have been downloaded previously or if we can transfer it
	    if(file.bitmap)
	    {
	        div.progressbar()

	        var chunks = file.size/chunksize;
	        if(chunks % 1 != 0)
	            chunks = Math.floor(chunks) + 1;

	        var value = chunks - file.bitmap.length

		    var div = $("#" + file.name)

		    if(chunks != undefined)
		        div.total = chunks;

		    div.html(Math.floor(value/div.total * 100) + '%');
	    }
	    else if(file.blob)
	        div.open(file.blob)
	    else if(hosting)
	        div.open(file)
	    else
	        div.transfer()

	    return div
	}
}


function ui_update_fileslist_downloading(files)
{
    var area = document.getElementById('Downloading').getElementsByTagName("tbody")[0]
    _ui_updatefiles(area, files, _ui_row_downloading)
}

function ui_update_fileslist_sharedpoints(sharedpoints)
{
    var area = document.getElementById('Sharedpoints').getElementsByTagName("tbody")[0]
    _ui_updatefiles(area, sharedpoints, _ui_row_sharedpoints)
}