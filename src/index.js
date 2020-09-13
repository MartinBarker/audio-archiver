var newUploadFiles = {}

/* 
run this code when the page first loads 
*/
updateUploadListDisplay()

//var $ = jQuery = require('jquery');
require('datatables.net-dt')();
require('datatables.net-rowreorder-dt')();

/*
Event Listeners
*/

//new upload file selection button 


     $("#newUploadFileSelection").change(async function (e) {
        var files = e.currentTarget.files;
        console.log('newUploadFileSelection: ', files);

        let event = {"dataTransfer":{"files":files}}
        newUploadFileDropEvent(event, false)

    });

//newUpload modal file drag & drop event listener
var newUploadBox = document.getElementById('newUploadFilesInput')
newUploadBox.addEventListener('drop', () => newUploadFileDropEvent(event, true))

newUploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});
newUploadBox.addEventListener('dragenter', (event) => {
    console.log('NEWUPLOAD File is in the Drop Space');
    //newUploadBox.style.backgroundColor = '#cccccc';
});

newUploadBox.addEventListener('dragleave', (event) => {
    console.log('NEWUPLOAD File has left the Drop Space');
    //newUploadBox.style.backgroundColor = '#ffffff'
});

//when upload modal is hidden, clear input values
$('#uploadModal').on('hidden.bs.modal', function (e) {
    document.getElementById('newUploadImageFileList').innerHTML = ''
    document.getElementById('newUploadAudioFileList').innerHTML = ''
    $(this)
        .find("input,textarea,select")
        .val('')
        .end()
        .find("input[type=checkbox], input[type=radio]")
        .prop("checked", "")
        .end();
})
//when upload modal is shown, click input field
$('#uploadModal').on('shown.bs.modal', function (e) {
    //if enter key is pressed, click confirm
    $(document).keypress(function (e) {
        if (e.which == 13) {
            document.getElementById('createUploadButton').click()
        }
    })
    //make input field focused
    $('input:text:visible:first', this).focus();
})
//whn delete modal is shown, if enter is pressed -> click confirm
$('#deleteModal').on('shown.bs.modal', function (e) {
    //if enter key is pressed, click confirm
    $(document).keypress(function (e) {
        if (e.which == 13) {
            document.getElementById('deleteUploadConfirm').click()
        }
    })
})
/*
Function
*/
function getDatatableContents(datatableID) {
    var table = $(`#${datatableID}`).DataTable();
    var data = table.rows().data();
    console.log('The table has ' + data.length);
    for (var i = 0; i < data.length; i++) {
        console.log(`row[${i}] = `, data[i])
    }

}

function getRandomNumbers() {
    const typedArray = new Uint8Array(5);
    const randomValues = window.crypto.getRandomValues(typedArray);
    return randomValues.join('');
}

async function addNewUpload(uploadTitle) {
    console.log('addNewUpload() newUploadFiles = ', newUploadFiles)
    //get unique uploadId timestamp
    var uploadId = getRandomNumbers()

    //get unique uploadNumber
    let uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    let uploadNumber = 1
    if (uploadList != null) {
        //while upload already exists with that key
        while (uploadList[`upload-${uploadNumber}`]) {
            uploadNumber++
        }
        //uploadNumber = (Object.keys(uploadList).length)+1;
    }

    //if title is null, set to default
    if (uploadTitle.length < 1) {
        uploadTitle = `upload-${uploadNumber}`
    }

    let uploadKey = `upload-${uploadNumber}`
    let uploadObj = { 'title': uploadTitle, 'files': newUploadFiles }
    newUploadFiles = {}

    console.log("+ addNewUpload() uploadKey = ", uploadKey, ", uploadObj = ", uploadObj, ", uploadNumber = ", uploadNumber)
    //add to uploadList obj
    await addToUploadList(uploadKey, uploadObj, uploadNumber)
    //update uploadListDisplay
    updateUploadListDisplay()
}

async function removeUploadFromUploadList(uploadId) {
    console.log("delete ", uploadId)
    let uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    console.log("delte(0 before = uploadList = ", uploadList)
    delete uploadList[uploadId]
    console.log("REM(0 after = ", uploadList)
    await localStorage.setItem('uploadList', JSON.stringify(uploadList))

}

async function deleteUpload(uploadId) {
    console.log("deleteUpload() uploadId = ", uploadId)
    //when delete button is clicked

    document.getElementById("deleteUploadConfirm").addEventListener('click', confirmDelete, { passive: false });

    async function confirmDelete() {
        console.log("deleteUpload() DELETE uploadId = ", uploadId)
        //remove card display
        document.getElementById(uploadId).remove()
        //remove card from db
        await removeUploadFromUploadList(uploadId)
        //remove event listener
        document.getElementById("deleteUploadConfirm").removeEventListener('click', confirmDelete);
    }




    //async function confirmDelete() {

    //}

}


async function getLocalStorage(input) {
    var item = await JSON.parse(localStorage.getItem(input))
    console.log(item)
}

async function renderIndividual(tempVar){
    console.log('renderIndividual() tempVar = ', tempVar)
}

async function deleteAllUploads(){
    await localStorage.setItem('uploadList', JSON.stringify({}))
    document.getElementById('uploadList').innerHTML = ''
}

async function createDataset(uploadFiles, uploadNumber) {
    return new Promise(async function (resolve, reject) {
        //create img selection part of form
        var imageSelectionOptions = ``
        try {
            //for each image
            for (var x = 0; x < uploadFiles.images.length; x++) {
                var imagFilename = `${uploadFiles.images[x].name}`
                imageSelectionOptions = imageSelectionOptions + `<option value="${imagFilename}">${imagFilename}</option>`
            }
        } catch (err) {

        }
    
        //create dataset
        let dataSet = []
        let fileCount = 1;
        try {
            //for each audio file
            for (var x = 0; x < uploadFiles['audio'].length; x++) {
                var audioObj = uploadFiles['audio'][x]
                
                //create img selection form
                var imgSelectionSelect = `<select style='width:150px' id='upload_${uploadNumber}_table-image-row_${x}' >`
                imgSelectionSelect = imgSelectionSelect + imageSelectionOptions + `</select>`

                //creaet vid output selection
                var videoOutputSelection = `
                <select id='upload_${uploadNumber}_table-vidFormat-row_${x}'>
                    <option value="0">mp4</option>
                    <option value="1">avi</option>
                </select> 
                `

                //create row obj
                let rowObj = {
                    //sequence(leave empty)
                    itemId: fileCount,
                    //select box(leave empty)
                    audio: audioObj.name,
                    format: audioObj.type,
                    length: audioObj.length,
                    imgSelection: imgSelectionSelect,
                    vidFormatSelection: videoOutputSelection,
                    audioFilepath: audioObj.path,
                    //video output(leave empty)
                }
                fileCount++
                dataSet.push(rowObj)
            }
        } catch (err) {

        }

        resolve(dataSet)
    })
}
function setAllVidFormats(uploadNum, rowNum, choice){

    for(var x = 0; x < rowNum; x++){
        document.getElementById(`upload_${uploadNum}_table-vidFormat-row_${x}`).selectedIndex = `${choice}`

        console.log(`document.getElementById('upload_${uploadNum}_table-vidFormat-row_${x}').selectedIndex = ${choice}`)
    }
    //document.getElementById(`upload_1_table-vidFormat-row_2`).selectedIndex = 1

    //document.getElementById(`upload_1_table-vidFormat-row_2`).selectedIndex = 1
}
async function createNewUploadCard(uploadTitle, uploadNumber, uploadFiles) {
    console.log('createNewUploadCard() uploadFiles = ', uploadFiles)
    return new Promise(async function (resolve, reject) {


        $("#uploadList").prepend(`
            
            <div id="upload-${uploadNumber}" class="card uploadCard ">
                <!-- Header -->
                <div class="card-header expandable">
                    <a data-toggle="collapse" href="#collapse-example-${uploadNumber}" aria-expanded="false" aria-controls="collapse-example-${uploadNumber}" class=' ' id="heading-example-${uploadNumber}" >
                        <i class="rotate fa fa-chevron-down " ></i>
                        ${uploadTitle}
                    </a>

                    <a style='cursor: pointer;'  data-toggle="modal" data-target="#deleteModal" onClick='deleteUpload("upload-${uploadNumber}")' > 
                        <i style='color:red' class="fa fa-close pull-right"></i>
                    </a>
                </div>


                <!-- Body -->
                <div id="collapse-example-${uploadNumber}" class="collapse show" aria-labelledby="heading-example-${uploadNumber}">
                    <div class="card-body">
                        
                        <!-- files table -->
                        <table id="upload_${uploadNumber}_table" class="display filesTable" cellspacing="2" width="100%">
                            <thead> 
                                <tr>
                                    <th>sequence</th>
                                    <th style='max-width:3px'>#</th>
                                    <th><input id='upload_${uploadNumber}_table-selectAll' type="checkbox"></th>
                                    <th>Audio</th>
                                    <th style='max-width:58px'>Length</th>
                                    <th style='max-width:400px'>
                                        <div >
                                            <label>Img:</label>
                                            <div id='upload_${uploadNumber}_table-image-col'></div>
                                        </div>
                                    </th>
                                    <th>
                                        Video Format: 
                                        <div>
                                            <select id='upload_${uploadNumber}_table-vidFormat-col'>
                                                <option value="0">mp4</option>
                                                <option value="1">avi</option>
                                            </select> 
                                        </div>
                                    </th>
                                    <th>audioFilepath</th>
                                    <!--
                                    <th>Video Output Folder: 
                                        <div >
                                            <button id='upload_${uploadNumber}_table-vidLocationButton'>Select</button>
                                            <input style='display:none' id='upload_${uploadNumber}_table-vidLocation' type="file" webkitdirectory />
                                        </div>
                                    </th>
                                    -->
                                </tr>
                            </thead>
                        </table>

                        <!-- Render Individual Button -->
                        <div class="card ml-5 mr-5 mt-1 renderOption" type='button' onclick="renderIndividual('test')">
                            <div class='card-body'>
                                <i class="uploadIndividual fa fa-plus-circle" aria-hidden="true"></i>Render <a id='upload_${uploadNumber}_numChecked'>0</a> individual files
                            </div>
                        </div>

                        <!-- Render Full Album Button -->
                        <div class="card ml-5 mr-5 mt-1 renderOption">
                            <div class='card-body' id='upload_${uploadNumber}_fullAlbumButton'>
                                <div>
                                    <i class="uploadIndividual fa fa-plus-circle" aria-hidden="true"></i>
                                    Render a Full Album video <strong><a style='float:right' id='upload_${uploadNumber}_fullAlbumStatus'></a></strong>
                                </div>
                                    <br>
                                    Num Tracks: <a id='upload_${uploadNumber}_numCheckedFullAlbum'>0</a>
                                    </br>
                                    Length: <a id='upload_${uploadNumber}_fullAlbumLength'>00:00</a>
                                    </br>
                                    Tracklist:
                                    <div id='upload_${uploadNumber}_fullAlbumTracklist'>
                                    </div>
                                    
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
        ` );

        /* TABLE ATTEMPT 1 */
        //create image dropdown selection
        var uploadImageSelectionColHeader = document.createElement('select')
        uploadImageSelectionColHeader.setAttribute('id', `upload-${uploadNumber}-imageOptionsCol`)
        uploadImageSelectionColHeader.setAttribute('style', `max-width:150px; text-align: left;`)
       
        try {
            for (var x = 0; x < uploadFiles.images.length; x++) {
                var rowImg = document.createElement('option')
                rowImg.setAttribute('value', x)
                rowImg.setAttribute('style', `width:150px; text-align: left;`)
                rowImg.innerHTML = `${uploadFiles.images[x].name}`
                uploadImageSelectionColHeader.appendChild(rowImg)
            }
        } catch (err) {

        }
        //add image dropdown selection to table html
       document.getElementById(`upload_${uploadNumber}_table-image-col`).appendChild(uploadImageSelectionColHeader)

        //create dataset
        let data = await createDataset(uploadFiles, uploadNumber)       

        var reorder = false;
        var searched = false;
        var origIndexes = [];
        var origSeq = [];
        var origNim = [];

        var table = $(`#upload_${uploadNumber}_table`).DataTable({
            "pageLength": 5000,
            select: {
                style: 'multi',
                selector: 'td:nth-child(2)'
            },
            columns: [
                { "data": "sequence" },
                { "data": "#" },
                { "data": "selectAll" },
                { "data": "audio" },
                //{ "data": "format" },
                { "data": "length" },
                { "data": "imgSelection" },
                { "data": "outputFormat" },
                { "data": "audioFilepath" },
            ],
            columnDefs: [
                { //invisible sequence num
                    searchable: false,
                    orderable: false,
                    visible: false,
                    targets: 0,
                },
                { //visible sequence num
                    searchable: false,
                    orderable: false,
                    targets: 1,
                    
                },
                {//select all checkbox
                    "className": 'selectall-checkbox',
                    "className": "text-center",
                    searchable: false,
                    orderable: false,
                    targets: 2,
                },
                {//audio filename 
                    targets: 3,
                    type: "natural"
                },
                /*
                {//audio format
                    targets: 4,
                    type: "string"
                },
                */
                { //audio file length
                    targets: 4,
                    type: "string"
                },
                { //image selection
                    targets: 5,
                    type: "string",
                    orderable: false,
                    className: 'text-left'
                },
                { //video output format
                    targets: 6,
                    type: "string",
                    orderable: false
                },
                {//audioFilepath
                    targets:7,
                    visible:false,
                }
            ],
            "language": {
                "emptyTable": "No files in this upload"
              },
            dom: 'rt',
            rowReorder: {
                dataSrc: 'sequence',
            },
            
        });

        var count = 1;
        data.forEach(function (i) {
            table.row.add({
                "sequence": i.itemId,
                "#": count,
                "selectAll": '<input type="checkbox">',
                "audio": i.audio,
                //"format": 'adasd',//i.format,
                "length": i.length,
                "imgSelection": i.imgSelection,
                "outputFormat": i.vidFormatSelection,
                //"outputLocation": "temp output location",
                "audioFilepath":i.audioFilepath,
            }).node().id = 'rowBrowseId' + i.sampleItemId;
            count++;
        });
        table.draw();

        //image selection changed
        $(`#upload-${uploadNumber}-imageOptionsCol`).change(function(event) {
            console.log(`upload-1-imageOptionsCol clicked`)
            let indexValueImgChoice = $(`#upload-${uploadNumber}-imageOptionsCol`).val()
            console.log('set all to ', indexValueImgChoice)
            table.rows().eq(0).each( function ( index ) {
                console.log('index = ', index)
                document.getElementById(`upload_${uploadNumber}_table-image-row_${index}`).selectedIndex = `${indexValueImgChoice}`
            } );
        });

        /*
        //prevent clicking form selection from selecting/deselcting row
        $(`#upload_${uploadNumber}_table tbody`).on( 'click', 'select', function (e) {
            e.stopPropagation();
          } );
          */
    
        $(`#upload_${uploadNumber}_fullAlbumButton`).on('click', async function (e){
            console.log('Begin Concat Audio Command')
        
            fullAlbum(`upload-${uploadNumber}`, uploadNumber)
       
        })
      

        /*

            //let concatAudioFfmpegCommand = await generateConcatAudioCommand(ffmpeg, selectedRows, outputFile)
            //console.log('concatAudioFfmpegCommand = ', concatAudioFfmpegCommand)
            

            */
            
        //select all checkbox clicked
        $(`#upload_${uploadNumber}_table-selectAll`).on('click', function (event) {
            let checkedStatus = document.getElementById(`upload_${uploadNumber}_table-selectAll`).checked
            if(checkedStatus == true){
                //box is going from unchecked to checked, so select all
                var rows = table.rows().nodes();
                $('input[type="checkbox"]', rows).prop('checked', true);
                table.$("tr").addClass('selected')
            }else{
                //unselect all
                var rows = table.rows().nodes();
                $('input[type="checkbox"]', rows).prop('checked', false);
                table.$("tr").removeClass('selected')
                
                
            }
            
            updateFullAlbumDisplayInfo(table, uploadNumber)
            
        });

        //row clicked
        $(`#upload_${uploadNumber}_table tbody`).on( 'click', 'tr', function () {        
            //determine whether or not to select/deselect & check/uncheck row
            //var count = $(`#upload_${uploadNumber}_table`).find('input[type=checkbox]:checked').length;
            //document.getElementById(`upload_${uploadNumber}_numChecked`).innerText = count
            //document.getElementById(`upload_${uploadNumber}_numCheckedFullAlbum`).innerText = count
            
            var isSelected = $(this).hasClass('selected')
            $(this).toggleClass('selected').find(':checkbox').prop('checked', !isSelected);

            updateFullAlbumDisplayInfo(table, uploadNumber)
   
            
            
        });
        
        //video output format selection changed
        $(`#upload_${uploadNumber}_table-vidFormat-col`).change(function(event) {
            console.log(`#upload_${uploadNumber}_table-vidFormat-col clicked`)
            let indexValueImgChoice = $(`#upload_${uploadNumber}_table-vidFormat-col`).val()
            var rowNum = table.data().count();
            console.log('rowNum = ', rowNum)
            //for(var x = 0; x < rowNum; x++){
            //    document.getElementById(`upload_${uploadNumber}_table-vidFormat-row_${x}`).selectedIndex = `${indexValueImgChoice}`
            //}
            //table.rows().eq(0).each( function ( index ) {
                //var elem = document.getElementById(`upload_${uploadNumber}_table-vidFormat-row_${index}`)
                //console.log(`elem = `, elem)
                //console.log(`elem.selectedIndex = `, elem.selectedIndex)
                //document.getElementById(`upload_${uploadNumber}_table-vidFormat-row_${index}`).selectedIndex = `${indexValueImgChoice}`
                //elem.selectedIndex = 1
                //setAllVidFormats(uploadNum, indexValueImgChoice)
            //} );
            //document.getElementById(`upload_1_table-vidFormat-row_2`).selectedIndex = 1

            setAllVidFormats(uploadNumber, rowNum, indexValueImgChoice)
        });

        $(`#upload_${uploadNumber}_table-vidLocationButton`).on('click',function(event) {
            $(`#upload_${uploadNumber}_table-vidLocation`).click()
        })

        $(`#upload_${uploadNumber}_table-vidLocation`).change(function(event) {
            var filePath = document.getElementById(`upload_${uploadNumber}_table-vidLocation`).files[0].path
            console.log('filePath = ', filePath)
            console.log('process.platform  =', process.platform)
            if((process.platform).includes('win')){
                var parseChar = "\\"
            }
            var path = (filePath.substring(0, filePath.lastIndexOf(parseChar)))+parseChar
            console.log('path = ', path)
            document.getElementById(`upload_${uploadNumber}_table-vidLocationButton`).innerText = path

        })

        table.on('order.dt', function (e, diff, edit) {
            console.log('order', reorder, searched);

            //don't adjust "#" column if already changed by rowReorder or search events
            if (!reorder && !searched) {
                console.log('order.dt - resetting order');
                i = 1;
                //assign "#" values in row order
                table.rows({ search: 'applied', order: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                    var data = this.data();
                    data['#'] = i;
                    i++;
                    this.data(data);
                });
            }
            //reset booleans
            reorder = false;
            searched = false;

        });
        table.on('row-reorder', function (e, details, edit) {
            console.log('row-reorder');
            //get original row indexes and original sequence (rowReorder indexes)
            origIndexes = table.rows().indexes().toArray();
            origSeq = table.rows().data().pluck('sequence').toArray();
        });

        table.on('search.dt', function () {
            console.log('search', reorder);
            //skip if reorder changed the "#" column order
            if (!reorder) {
                console.log('search.dt - resetting order');
                i = 1;
                //assign "#" values in row order
                table.rows({ search: 'applied', order: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                    var data = this.data();
                    data['#'] = i;
                    i++;
                    this.data(data);
                });
            }
            //don't change "#" order in the order event
            searched = true;
        });

        table.on('row-reordered', function (e, details, edit) {
            console.log('row-reorderd');
            //get current row indexes and sequence (rowReorder indexes)
            var indexes = table.rows().indexes().toArray();
            //console.log('org indexes', origIndexes);
            //console.log('new indexes', indexes);
            var seq = table.rows().data().pluck('sequence').toArray();
            //console.log('org seq', origSeq);
            //console.log('new seq', seq);
            i = 1;

            for (var r = 0; r < indexes.length; r++) {
                //get row data
                var data = table.row(indexes[r]).data();
                //console.log('looking for',seq[r]);
                //get new sequence 
                //origSeq   [1, 3, 4, 2]
                //seq       [3, 4, 1, 2]
                //indexes   [0, 2, 3, 1]
                //use the new sequence number to find index in origSeq
                //the (index + 1) is the original row "#" to assign to the current row
                newSeq = origSeq.indexOf(seq[r]);
                //console.log('found new seq',newSeq);

                //assign the new "#" to the current row
                data['#'] = newSeq + 1;
                table.row(indexes[r]).data(data);

            }
            //re-sort the table by the "#" column
            table.order([1, 'asc']);

            //don't adjust the "#" column in the search and order events
            reorder = true;
        });
        
        //row-reorder
        table.on('row-reorder', function (e, diff, edit) {
            var result = 'Reorder started on row: ' + edit.triggerRow.data()[1] + '<br>';

            for (var i = 0, ien = diff.length; i < ien; i++) {
                var rowData = table.row(diff[i].node).data();

                result += rowData[1] + ' updated to be in position ' +
                    diff[i].newData + ' (was ' + diff[i].oldData + ')<br>';
            }

            console.log(result);
        });

        resolve()
    })
}



async function fullAlbum(uploadName, uploadNumber) {
    document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = 'Generating Audio: 0%'

    //get table
    var table = $(`#upload_${uploadNumber}_table`).DataTable()
    //get all selected rows
    var selectedRows = table.rows( '.selected' ).data()
    //get outputFile location
    var path = require('path');
    var outputDir = path.dirname(selectedRows[0].audioFilepath)
    //create outputfile
    var timestamp = new Date().getUTCMilliseconds();
    let outputFilepath = `${outputDir}\\output-${timestamp}.mp3` 

    //create concat audio file
    await combineMp3FilesOrig(selectedRows, outputFilepath, '320k', timestamp, uploadNumber);

    //get img input
    var uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    var upload = uploadList[`upload-${uploadNumber}`]
    let imgInput = upload.files.images[0].path
    
    let vidOutput = `${outputDir}\\fullAlbum-${timestamp}.mp4` 
    await generateVid(outputFilepath, imgInput, vidOutput, uploadNumber)
    //await generateVid(selectedRows[0].audioFilepath, imgInput, vidOutput, uploadNumber)

    console.log('deleting file')
    //delete audio file
    deleteFile(outputFilepath)

    console.log('after caclling deleting file')
}

function deleteFile(path){
    console.log('deleteFile()')
    const fs = require('fs')
    fs.unlink(path, (err) => {
    if (err) {
        console.error("err deleting file = ", err)
        return
    }

    
    console.log('file removed')

    //file removed
    })
}

async function generateVid(audioPath, imgPath, vidOutput, uploadNumber){
    return new Promise(async function (resolve, reject) {
        console.log('generateVid audioPath = ', audioPath, '\n imgPath = ', imgPath, '\n vidOutput = ', vidOutput)
        document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = `Generating Video: 0%`

        //begin get ffmpeg info
        const ffmpeg = require('fluent-ffmpeg');
        //Get the paths to the packaged versions of the binaries we want to use
        var ffmpegPath = require('ffmpeg-static-electron').path;
        ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked')
        var ffprobePath = require('ffprobe-static-electron').path;
        ffprobePath = ffprobePath.replace('app.asar', 'app.asar.unpacked')
        //tell the ffmpeg package where it can find the needed binaries.
        ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg.setFfprobePath(ffprobePath);
        //end set ffmpeg info
 /*
        let audioFilePath = 'C:\\Users\\marti\\Documents\\martinradio\\soulseek\\complete\\smoothergrooves\\gvcd 3008 richard caiton reflections\\01.i like to get near you.mp3'
  
        let imgFilePath = 'C:\\Users\\marti\\Documents\\martinradio\\soulseek\\complete\\smoothergrooves\\gvcd 3008 richard caiton reflections\\front.jpg'
        let videoPath = 'C:\\Users\\marti\\Documents\\martinradio\\soulseek\\complete\\smoothergrooves\\gvcd 3008 richard caiton reflections\\YOUTUBE.mp4'

      
      ffmpeg()
            .input(coverFile)
            .loop()
            .addInputOption('-framerate 2')
            .input(mp3File)
            .videoCodec('libx264')
            .audioCodec('copy')
            .outputOptions([
              '-preset medium',
              '-tune stillimage',
              '-crf 18',
              '-pix_fmt yuv420p',
              '-shortest'
            ])
           .output(orderFolder + '/output.mp4')
        */

        //audioPath = 'C:\\Users\\marti\\Documents\\martinradio\\soulseek\\complete\\smoothergrooves\\gvcd 3008 richard caiton reflections\\01.i like to get near you.mp3'
            
        //ffmpeg -loop 1 -framerate 2 -i "'+ imageFilepath +'" -i "'+ sourceAudioFilepath +'" -vf "scale=2*trunc(iw/2):2*trunc(ih/2),setsar=1" -c:v libx264 -preset medium -tune stillimage -crf 18 -c:a copy -b:a 320k -shortest -vf scale=' + resolution + ' -pix_fmt yuv420p "'+ outputFilename  +'.mp4"'
        
        ffmpeg()
        .input(imgPath)
        .loop()
        .addInputOption('-framerate 2')
        .input(audioPath)
        .videoCodec('libx264')
        .audioCodec('copy')
        .audioBitrate('320k')
        .videoBitrate('8000k', true) 
        .size('1920x1080')
        .outputOptions([
            '-preset medium',
            '-tune stillimage',
            '-crf 18',
            '-pix_fmt yuv420p',
            '-shortest'
        ])
        
        .on('progress', function(progress) {
            document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = `Generating Video: ${Math.round(progress.percent)}%`
            console.info(`vid() Processing : ${progress.percent} % done`);
        })
        .on('codecData', function(data) {
            console.log('vid() codecData=',data);
        })
        .on('end', function() {
            document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = `Video generated.`
            console.log('vid()  file has been converted succesfully; resolve() promise');
            resolve();
        })
        .on('error', function(err) {
            document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = `Error generating video.`
            console.log('vid() an error happened: ' + err.message, ', reject()');
            reject(err);
        })
        .output(vidOutput).run()
  
        /*
        .input(audioPath)
        .input(imgPath)
        .audioBitrate('320k')
        .videoBitrate('8000k', true) //1080p
        .size('1920x1080')
        .outputOptions('-c:v libx264')
        .outputOptions('-pix_fmt yuv420p')
        .outputOptions('-f mp4')


        //ffmpeg -loop 1 -framerate 2 -i input.png -i audio.m4a -c:v libx264 -preset medium -tune stillimage -crf 18 -c:a copy -shortest -pix_fmt yuv420p output.mkv
        //ffmpeg -loop 1 -framerate 2 -i imageFilepath -i sourceAudioFilepath -vf "scale=2*trunc(iw/2):2*trunc(ih/2),setsar=1" -c:v libx264 -preset medium -tune stillimage -crf 18 -c:a copy -b:a 320k -shortest -vf scale=resolution -pix_fmt yuv420p outputFilename.mp4"'


        ffmpeg -loop 1 -framerate 2 -i 'C:\\Users\\marti\\Documents\\martinradio\\soulseek\\complete\\smoothergrooves\\gvcd 3008 richard caiton reflections\\front.jpg' -i 'C:\\Users\\marti\\Documents\\martinradio\\soulseek\\complete\\smoothergrooves\\gvcd 3008 richard caiton reflections\\01.i like to get near you.mp3' -vf "scale=2*trunc(iw/2):2*trunc(ih/2),setsar=1" -c:v libx264 -preset medium -tune stillimage -crf 18 -c:a copy -b:a 320k -shortest -vf scale=resolution -pix_fmt yuv420p 'C:\\Users\\marti\\Documents\\martinradio\\soulseek\\complete\\smoothergrooves\\gvcd 3008 richard caiton reflections\\YOUTUBE.mp4'


        */


    })
}


async function combineMp3FilesOrig(selectedRows, outputFilepath, bitrate, timestamp, uploadNumber) {
    console.log(`combineMp3FilesOrig(): ${outputFilepath}`)
    
    //begin get ffmpeg info
    const ffmpeg = require('fluent-ffmpeg');
    //Get the paths to the packaged versions of the binaries we want to use
    var ffmpegPath = require('ffmpeg-static-electron').path;
    ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked')
    var ffprobePath = require('ffprobe-static-electron').path;
    ffprobePath = ffprobePath.replace('app.asar', 'app.asar.unpacked')
    //tell the ffmpeg package where it can find the needed binaries.
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
    //end set ffmpeg info

    //create ffmpeg command
    console.log(`combineMp3FilesOrig(): create command`)
    const command = ffmpeg();
    //set command inputs
    //command.input('C:\\Users\\marti\\Documents\\martinradio\\uploads\\CharlyBoyUTurn\\5. Akula (Club Mix).flac') //06:16
    //command.input('C:\\Users\\marti\\Documents\\martinradio\\uploads\\CharlyBoyUTurn\\4. Civilian Barracks.flac') //05:52
    //add inputs
    var count = selectedRows.length;
    for(var i = 0; i < count; i++){
        command.input(selectedRows[i].audioFilepath)
    } 

    return new Promise((resolve, reject) => {
        console.log(`combineMp3FilesOrig(): command status logging`)
        command.on('progress', function(progress) {
            console.info(`Processing : ${progress.percent} % done`);
            document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = `Generating Audio: ${Math.round(progress.percent)}%`
        })
        .on('codecData', function(data) {
            console.log('codecData=',data);
        })
        .on('end', function() {
            document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = `Audio generated.`
            console.log('file has been converted succesfully; resolve() promise');
            resolve();
        })
        .on('error', function(err) {
            document.getElementById(`upload_${uploadNumber}_fullAlbumStatus`).innerText = `Error generating audio.`
            console.log('an error happened: ' + err.message, ', reject()');
            reject(err);
        })
        console.log(`combineMp3FilesOrig(): add audio bitrate to command`)
   
        console.log(`combineMp3FilesOrig(): tell command to merge inputs to single file`)
        command.mergeToFile(outputFilepath);
        command.audioBitrate(bitrate)
        console.log(`combineMp3FilesOrig(): end of promise`)

    });
    console.log(`combineMp3FilesOrig(): end of function`)
}

let isConcatAudioRunning = false

async function generateConcatAudio(selectedRows){
    return new Promise(async function (resolve, reject) {
            //use path to get dir of where an audioFile is located, and use that to create the outputFilepath
            var path = require('path');
            var outputDir = path.dirname(selectedRows[0].audioFilepath)
            //create outputfile
            let outputFile = `${outputDir}/concatAudio.mp3`

             //begin get ffmpeg info
            const ffmpeg = require('fluent-ffmpeg');
            //Get the paths to the packaged versions of the binaries we want to use
            const ffmpegPath = require('ffmpeg-static').replace(
                'app.asar',
                'app.asar.unpacked'
            );
            const ffprobePath = require('ffprobe-static').path.replace(
                'app.asar',
                'app.asar.unpacked'
            );
            //tell the ffmpeg package where it can find the needed binaries.
            ffmpeg.setFfmpegPath(ffmpegPath);
            ffmpeg.setFfprobePath(ffprobePath);
            //end get ffmpeg info
            
            
            //create ffmpeg command
            const command = ffmpeg();
            //add inputs
            var count = selectedRows.length;
            for(var i = 0; i < count; i++){
                command.input(selectedRows[i].audioFilepath)
            }   
            console.log('runConcatAudioCommand() adding more to command')
            //status updates
            command.on('progress', function(progress) {
                console.info(`Processing : ${progress.percent} % done`);
            })
            .on('start', function(data) {
                isConcatAudioRunning = true;
                console.log('start ');
            })
            .on('codecData', function(data) {
                console.log('codecData=',data);
            })
            .on('end', function() {
                console.log('file has been converted succesfully, resolving');
                
                resolve(outputFile)
            })
            .on('error', function(err) {
                console.log('an error happened: ' + err.message);
                //resolve('err')
            })
            .audioBitrate('320k')
            .mergeToFile(outputFile)
            //var outputFile = `${outputDir}/MERGEDAUDIO.mp3`
            //var outputFileVid = `${outputDir}vvvvv.mp4`
            //console.log('outputFile = ', outputFile)
            
            //trigger once
            //let commandRspInit = runConcatAudioCommand(selectedRows, outputDir)
            
            //console.log('commandRspInit = ', commandRspInit)
            //let resp = await exec()
            //console.log('after wait')
            //console.log('isConcatAudioRunning == ', isConcatAudioRunning)
            /*
            while(isConcatAudioRunning == false){
                console.log('isConcatAudioRunning == false')
                await wait(6)
                //wait till done
                let commandRsp = runConcatAudioCommand(selectedRows, outputDir)
                console.log('commandRsp = ', commandRsp)
            }
            console.log('isConcatAudioRunning != false')
            //should be saved at outputDir
            

            resposne('done ge)
*/
           

    })
}
//the code will execute in 1 3 5 7 9 seconds later
function exec() {
    return new Promise(async function (resolve, reject) {
    for(var i=0;i<1;i++) {
        setTimeout(function() {
            console.log(new Date());   //It's you code
        },(i+i+1)*1000);
    }
    resolve('done')
})
}

async function runConcatAudioCommand(selectedRows, outputDir){
    return new Promise(async function (resolve, reject) {
        //begin get ffmpeg info
        const ffmpeg = require('fluent-ffmpeg');
        //Get the paths to the packaged versions of the binaries we want to use
        const ffmpegPath = require('ffmpeg-static').replace(
            'app.asar',
            'app.asar.unpacked'
        );
        const ffprobePath = require('ffprobe-static').path.replace(
            'app.asar',
            'app.asar.unpacked'
        );
        //tell the ffmpeg package where it can find the needed binaries.
        ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg.setFfprobePath(ffprobePath);
        //end get ffmpeg info

        console.log('runConcatAudioCommand()')
        //create ffmpeg command
        const command = ffmpeg();
        //add inputs
        var count = selectedRows.length;
        for(var i = 0; i < count; i++){
            command.input(selectedRows[i].audioFilepath)
        }   
        console.log('runConcatAudioCommand() adding more to command')
        //status updates
        command.on('progress', function(progress) {
            console.info(`Processing : ${progress.percent} % done`);
        })
        .on('start', function(data) {
            isConcatAudioRunning = true;
            console.log('start ');
        })
        .on('codecData', function(data) {
            console.log('codecData=',data);
        })
        .on('end', function() {
            console.log('file has been converted succesfully, resolving');
            
            resolve('DONE')//outputFile)
        })
        .on('error', function(err) {
            console.log('an error happened: ' + err.message);
            //resolve('err')
        })
        .audioBitrate('320k')
        .mergeToFile(`${outputDir}/concatAudio.mp3`)
        //resolve('done')
    });

        //command.run()
}

function waitSeconds(iMilliSeconds) {
    var counter= 0
        , start = new Date().getTime()
        , end = 0;
    while (counter < iMilliSeconds) {
        end = new Date().getTime();
        counter = end - start;
    }
}

async function updateFullAlbumDisplayInfo(table, uploadNumber){
    //get all selected rows
    var selectedRows = table.rows( '.selected' ).data()
    //get number of selected tracks
    var count = selectedRows.length;
    //get total length of full album vid
    var fullAlbumLength = ''
    var fullAlbumTracklist = ''
    for(var i = 0; i < count; i++){
        fullAlbumTracklist = `${fullAlbumTracklist}${selectedRows[i].audio}<br>`
        //set prevTime
        var prevTime = ''
        if(fullAlbumLength == ''){
            prevTime = '0:00:00'
        }else{
            prevTime = fullAlbumLength
        }
        //set currTime
        var currTime = selectedRows[i].length
        //calculate sum
        fullAlbumLength = sum(prevTime , currTime );
    }
    //set fullAlbumLength var
    document.getElementById(`upload_${uploadNumber}_fullAlbumLength`).innerText = fullAlbumLength
    //get tracklist

    //set tracklist
    document.getElementById(`upload_${uploadNumber}_fullAlbumTracklist`).innerHTML = fullAlbumTracklist
    
    //set count
    document.getElementById(`upload_${uploadNumber}_numChecked`).innerText = count
    document.getElementById(`upload_${uploadNumber}_numCheckedFullAlbum`).innerText = count

    

}

async function updateUploadListDisplay() {
    let uploadListDisplay = document.getElementById('uploadList')

    //get uploadList from localstorage
    var uploadList = await JSON.parse(localStorage.getItem('uploadList'))

    console.log('~ updateUploadListDisplay() uploadList = ', uploadList)

    //if uploadList exists
    if (uploadList != null) {

        //for each object in uploadList
        for (const [key, value] of Object.entries(uploadList)) {
            let uploadId = key
            let uploadTitle = value.title
            let uploadFiles = value.files
            uploadNumber = key.split('-')[1]
            //console.log('~ updateDisplay() uploadNumber = ', uploadNumber)
            //if div with id = upload-${uploadNumber} does not exist:
            var uploadObj = document.getElementById(`upload-${uploadNumber}`)
            //console.log("~ updateUploadListDisplay() uploadObj = ", uploadObj)
            if (uploadObj == null) {
                //console.log('~ updateUploadListDisplay() add to display: ', key, ', ', value)
                await createNewUploadCard(uploadTitle, uploadNumber, uploadFiles)
            } else {
                //console.log('~ updateUploadListDisplay() dont add already visible: ', key, ', ', value)
            }




            //console.log('updateUploadListDisplay() newUploadCard = ', newUploadCard)

            //uploadListDisplay.appendChild(newUploadCard);
            //console.log(`    ${key}: ${value}`);
            //uploadListDisplay.innerHTML = uploadListDisplay.innerHTML + `[${key}]-${JSON.stringify(value)}]<br><hr>`
        }
    } else {
        //console.log('~ updateUploadListDisplay() uploadList = null')
    }

}

async function addToUploadList(uploadKey, uploadValue) {
    return new Promise(async function (resolve, reject) {

        var uploadList = await JSON.parse(localStorage.getItem('uploadList'))

        //if uploadList does not exists
        if (uploadList == null) {
            //create new uploadList object
            let newUploadListObj = {}
            //set uploadList in localstorage
            await localStorage.setItem('uploadList', JSON.stringify(newUploadListObj))
            uploadList = await JSON.parse(localStorage.getItem('uploadList'))
        }

        //if uploadKey does not exist
        if (uploadList[uploadKey] == null) {
            console.log(`setting ${uploadKey} in uploadList to be = `, uploadValue)
            uploadList[uploadKey] = uploadValue
            uploadList[uploadKey]['audio'] = uploadValue['audio']
        } else {
            //console.log(`${uploadKey} does exist in uploadList, so update pre-existing obj`)
        }

        console.log("++ addToUploadList() done uploadList = ", uploadList)
        let result = await localStorage.setItem('uploadList', JSON.stringify(uploadList))
        console.log('result = ', result)

        var tempuploadList = await JSON.parse(localStorage.getItem('uploadList'))
        console.log('tempuploadList = ', tempuploadList)
        resolve('done')
    })
}



async function newUploadFileDropEvent(event, preventDefault) {
    if(preventDefault){
        event.preventDefault();
        event.stopPropagation();
    }
    //sort all files into audio / images 
    var fileList = { 'images': [], 'audio': [] }
    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path 
        if ((f.type).includes('image')) {
            //fileList.images.push({'path':f.path, 'type':f.type, 'name':f.name})
            fileList.images.push({ 'path': f.path, 'type': f.type, 'name': f.name })

        } else if ((f.type).includes('audio')) {
            var splitType = (f.type).split('/')
            var audioFormat = splitType[1]
       
            let audioLength = await getDuration(f.path)
            console.log('raw audioLength = ', audioLength)
            audioLength = new Date(audioLength * 1000).toISOString().substr(11, 8)
     
            fileList.audio.push({ 'path': f.path, 'type': audioFormat, 'name': f.name, 'length': audioLength })
        }
    }
    newUploadFiles = fileList
    console.log('newUploadFiles = ', newUploadFiles)

    

    //display files in UI
    var imageFilesHtml = ''
    var audioFilesHtml = ''
    for (const [key, value] of Object.entries(newUploadFiles)) {
        console.log('key = ', key, ', value = ', value)
        if (key == 'images') {
            for (var i = 0; i < value.length; i++) {
                imageFilesHtml = imageFilesHtml + `${value[i]['name']} <br>`
            }

        } else if (key == 'audio') {
            //for (const [audioFormat, audioFiles] of Object.entries(newUploadFiles['audio'])) {
            for (var x = 0; x < value.length; x++) {
                //console.log('f = ', audioFiles[x]['name'])
                audioFilesHtml = audioFilesHtml + `${value[x]['name']} <br>`
            }
            //}
        }
    }

    document.getElementById('newUploadImageFileList').innerHTML = imageFilesHtml
    document.getElementById('newUploadAudioFileList').innerHTML = audioFilesHtml

    //add file to uploadList object
    //addNewUpload(fileList)
}

function sum(date1, date2){
    date1 = date1.split(":");
    date2 = date2.split(":");
    const result = [];
  
    date1.reduceRight((carry,num, index) => {
      const max = [24,60,60][index];
      const add =  +date2[index];
      result.unshift( (+num+add+carry) % max );
      return Math.floor( (+num + add + carry) / max );
    },0);
  
    return result.map(r => String(r).padStart(2, "0")).join(":");
  }

function getDuration(src) {
    return new Promise(function (resolve) {
        var audio = new Audio();
        $(audio).on("loadedmetadata", function () {
            resolve(audio.duration);
        });
        audio.src = src;
    });
}

async function ffmpegSingleRender(audioPath, imgPath, videoPath){
    console.log('ffmpeg-test')
    //require the ffmpeg package so we can use ffmpeg using JS
    //const ffmpeg = require('fluent-ffmpeg');
    //Get the paths to the packaged versions of the binaries we want to use
    const ffmpegPath = require('ffmpeg-static').replace(
        'app.asar',
        'app.asar.unpacked'
    );
    const ffprobePath = require('ffprobe-static').path.replace(
        'app.asar',
        'app.asar.unpacked'
    );
    //tell the ffmpeg package where it can find the needed binaries.
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
    var audioPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\3. Yaldut.flac"
    var imgPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\front.jpg"
    var videoPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\Yaldut.mp4"
    var outputPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\output.m4v"
    let proc = await ffmpeg()
    .input(audioPath)
    .input(imgPath)
    // using 25 fps
    .fps(25)
    //audio bitrate
    .audioBitrate('320k')
    //video bitrate
    .videoBitrate('8000k', true) //1080p
    //resolution
    .size('1920x1080')
    // setup event handlers
    .on('end', function() {
        console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
        console.log('an error happened: ' + err.message);
    })
    // save to file
    .save(videoPath);

    //old under not working
    /*
    //convert image to video
    var proc = ffmpeg(imgPath)
    // loop for 5 seconds
    .loop(5)
    // using 25 fps
    .fps(25)
    //audio bitrate
    .audioBitrate('128k')
    //video bitrate
    .videoBitrate('8000k', true)
    //resolution
    .size('1920x1080')
    // setup event handlers
    .on('end', function() {
        console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
        console.log('an error happened: ' + err.message);
    })
    // save to file
    .save(outputPath);
    */
    console.log("end of ffmpeg-test")
}

//datatables natural sort plugin code below:

(function() {
 
    /*
     * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
     * Author: Jim Palmer (based on chunking idea from Dave Koelle)
     * Contributors: Mike Grier (mgrier.com), Clint Priest, Kyle Adams, guillermo
     * See: http://js-naturalsort.googlecode.com/svn/trunk/naturalSort.js
     */
    function naturalSort (a, b, html) {
        var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?%?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            htmre = /(<([^>]+)>)/ig,
            // convert all to strings and trim()
            x = a.toString().replace(sre, '') || '',
            y = b.toString().replace(sre, '') || '';
            // remove html from strings if desired
            if (!html) {
                x = x.replace(htmre, '');
                y = y.replace(htmre, '');
            }
            // chunk/tokenize
        var xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
            yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null;
     
        // first try and sort Hex codes or Dates
        if (yD) {
            if ( xD < yD ) {
                return -1;
            }
            else if ( xD > yD ) {
                return 1;
            }
        }
     
        // natural sorting through split numeric strings and default strings
        for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
            // find floats not starting with '0', string or 0 if not defined (Clint Priest)
            var oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc], 10) || xN[cLoc] || 0;
            var oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc], 10) || yN[cLoc] || 0;
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
                return (isNaN(oFxNcL)) ? 1 : -1;
            }
            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            else if (typeof oFxNcL !== typeof oFyNcL) {
                oFxNcL += '';
                oFyNcL += '';
            }
            if (oFxNcL < oFyNcL) {
                return -1;
            }
            if (oFxNcL > oFyNcL) {
                return 1;
            }
        }
        return 0;
    }
     
    jQuery.extend( jQuery.fn.dataTableExt.oSort, {
        "natural-asc": function ( a, b ) {
            return naturalSort(a,b,true);
        },
     
        "natural-desc": function ( a, b ) {
            return naturalSort(a,b,true) * -1;
        },
     
        "natural-nohtml-asc": function( a, b ) {
            return naturalSort(a,b,false);
        },
     
        "natural-nohtml-desc": function( a, b ) {
            return naturalSort(a,b,false) * -1;
        },
     
        "natural-ci-asc": function( a, b ) {
            a = a.toString().toLowerCase();
            b = b.toString().toLowerCase();
     
            return naturalSort(a,b,true);
        },
     
        "natural-ci-desc": function( a, b ) {
            a = a.toString().toLowerCase();
            b = b.toString().toLowerCase();
     
            return naturalSort(a,b,true) * -1;
        }
    } );
     
    }());