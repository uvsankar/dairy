$('#info')[0].innerText  = new Date().toDateString();

function saveJournalEntry(journalName, entryId, data){
    let baseUrl = 'http://localhost:8080'
    jQuery.post(`${baseUrl}/journal/${journalName}/${entryId}`, {data}).done(function(result){
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
        let data = $('main')[0].innerText
        //HACK: Harcoding journal name
        saveJournalEntry('Personal', entryId, data);
    }
      
  });