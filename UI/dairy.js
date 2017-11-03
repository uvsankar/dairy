/*
    Need to develop a proper Single Page Application. 
    until then this is what I can come up with.
    The minimalistic UI was developed by @nithinsanjey.
    I DONT KNOW TO DESIGN WEBPAGES . 
    WEB DESIGNERS FEEL FREE TO CONTRIBUTE!!!
*/

$('#info')[0].innerText  = new Date().toDateString();
let baseUrl = 'http://localhost:8080';

function saveJournalEntry(journalName, entryId, data){
    let payload = {
        data,
        createdDate: new Date().toISOString()
    }
    jQuery.post(`${baseUrl}/journal/${journalName}/${entryId}`, payload).done(function(result){
        alert("saved");
        console.log("saved: " + result)
    }).fail(function(err){
        alert("failed")
        console.error(err)
    })
}

$(document).keypress("s",function(e) {
    if(e.ctrlKey && e.shiftKey){
        let entryId = $('h1')[0].innerText
        let data = $('main')[0].innerHTML
        //HACK: Harcoding journal name
        saveJournalEntry('Personal', entryId, data);
    }
      
  });

if(location.hash){
    let entryId = location.hash.slice(1);
    if(entryId)
        jQuery.get(`${baseUrl}/journal/personal/${entryId}`).done(function(result){
            $('#info')[0].innerText  = new Date(result.timestamp).toDateString();
            $('main')[0].innerHTML = result.data;
            $('h1')[0].innerText = entryId;

            $('[contenteditable]').attr('contenteditable', false)

            $('#info')[0].innerText  = new Date(result.createdDate).toDateString();
        })
}