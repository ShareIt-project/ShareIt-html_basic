function oldBrowser()
{
	$('#clicky').html('Your browser is not modern enough to serve as a host. :(<br /><br />(Try Chrome or Firefox!)');
}

function ui_onopen()
{
	$('#clicky').html("<br /><br /><br /><br />Click here to choose files");
	$('#fileslist').html('Awaiting file list..');
}

function log(level, msg)
{
	switch(level)
	{
		case 'warning':
			msg = '<span style="color: red;">' + msg + '</span>'
			break
	}

	msg += '<br/>'

	$('#log').append(msg);
}

function info(msg)
{
	log('info', msg);
}

function warning(msg)
{
	log('warning', msg);
}

//$(document).ready(function()
//{
//	document.getElementById('files').addEventListener('change', function(event)
//	{
//		files_change(event.target.files); // FileList object
//    }, false);
//})

function ui_ready_fileschange(func)
{
	document.getElementById('files').addEventListener('change', function(event)
	{
		func(event.target.files); // FileList object
    }, false);
}

var transfer_begin
function ui_ready_transferbegin(func)
{
	transfer_begin = func
}

function _button(file, hosting)
{
    var div = document.createElement("DIV");
    	div.id = file.name

	div.transfer = function()
	{
	    var transfer = document.createElement("A");
	    	transfer.onclick = function()
	    	{
	    		if(transfer_begin)
			    	transfer_begin(file);
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

		ui_filedownloading(file.name, value, chunks)
    }
    else if(file.blob)
        div.open(file.blob)
    else if(hosting)
        div.open(file)
    else
    	div.transfer()

    return div
}

function _ui_updatefiles(area, files, hosting)
{
	var filestable = document.createElement('TABLE');
		filestable.id = "filestable"
		filestable.cellspacing = 0
		filestable.summary = ""

	var tr = document.createElement('TR');
	filestable.appendChild(tr);

	var th = document.createElement('TH');
		th.scope = "col"
		th.abbr = "Filename"
		th.class = "nobg"
		th.width = "60%"
		th.appendChild(document.createTextNode("Filename"));
	tr.appendChild(th);

	var th = document.createElement('TH');
		th.scope = "col"
		th.abbr = "Size"
		th.class = "nobg"
		th.width = "20%"
		th.appendChild(document.createTextNode("Size"));
	tr.appendChild(th);

	var th = document.createElement('TH');
		th.scope = "col"
		th.abbr = "Status"
		th.class = "nobg"
		th.width = "20%"
		th.appendChild(document.createTextNode("Action"));
	tr.appendChild(th);

	// Remove old table and add new empty one
	while(area.firstChild)
		area.removeChild(area.firstChild);
  	area.appendChild(filestable)

	for(var filename in files)
		if(files.hasOwnProperty(filename))
		{
            var file = files[filename]

			var tr = document.createElement('TR');
			filestable.appendChild(tr)

			var th = document.createElement('TH');
				th.scope = "row"
				th.class = "spec"
				th.appendChild(document.createTextNode(file.name));
			tr.appendChild(th)

			var td = document.createElement('TD');
				td.appendChild(document.createTextNode(file.size));
			tr.appendChild(td)

			var td = document.createElement('TD');
				td.class = "end"
				td.appendChild(_button(file, hosting));
			tr.appendChild(td)
		}
}

function ui_updatefiles_host(files)
{
    _ui_updatefiles(document.getElementById('clicky'), files, true)
}

function ui_updatefiles_peer(files)
{
    _ui_updatefiles(document.getElementById('fileslist'), files, false)
}

function ui_filedownloading(filename, value, total)
{
    var div = $("#" + filename)

    if(total != undefined)
        div.total = total;

	div.html(Math.floor(value/div.total * 100) + '%');
}

function ui_filedownloaded(file)
{
	document.getElementById(file.name).open(file.blob);

	info("Transfer finished!");
}

function ui_peerstate(msg)
{
	$('#peer').html(msg);
}
