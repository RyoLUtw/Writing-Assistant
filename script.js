var stepsCompleted = [0, 0, 0, 0, 0]
var processedSentences = []
var revisedSentences = []
var newParagraph = []
var revising = 0
var currentCorrectionIndex = 0;
var errorTags = {}
var columnHidden = false;
var oriTextHidden = true;
var modifiedText = ""
var modifiedTextArray = []
var modifiedTextHTML = ""
var revisedVersionText = ""
var spannedRTArray = []
var dsParagraph = []
var TUArray = [];
//prevent accidental reload of the page
window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};


// Show the default active tab
document.getElementById("Tab1").style.display = "block";
document.getElementsByClassName("tablinks")[1].className += " active";

//==================== saving & loading ===========================================

function loadPrevResultFromLocalStorage() {
  const jsonData = localStorage.getItem("上次學習階段暫存");
  data = JSON.parse(jsonData)
  if (jsonData) {
    processJSONData(data);
  } else {
    alert("瀏覽器中無暫存資料")
  }
}

function saveStudySetToLocalStorage() {
  jsonString = retrieveStudySetData();
  fileName = document.getElementById("fileName").value;
  localStorage.setItem(fileName, jsonString);
  alert('學習集已儲存');
}

function saveStudySetToDevice() {
  jsonString = retrieveStudySetData();
  fileName = document.getElementById("fileName").value;
  const link = document.createElement('a');
  link.href = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
  link.download = fileName + '.json';
  //document.body.appendChild(link);
  link.click();
}

function saveProgress(step) {
  stepsCompleted[step - 1] = 1
  console.log(stepsCompleted)
  jsonString = retrieveStudySetData();
  fileName = "上次學習階段暫存";
  localStorage.setItem(fileName, jsonString);

}

function loadStudySetFromDevice(event) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';

  fileInput.onchange = function(event) {
    const input = event.target;
    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = function(e) {
      const jsonContent = e.target.result;
      const data = JSON.parse(jsonContent);
      processJSONData(data);
    };

    reader.readAsText(file);
  };

  fileInput.click();
}

function retrieveStudySetData() {
  const text = document.getElementById("inputText").value;
  const combinedData = {
    text: text,
    processedSentences: processedSentences,
    revisedSentences: revisedSentences,
    errorTags: errorTags,
    revisedVersionText: revisedVersionText,
    dsParagraph: dsParagraph,
    stepsCompleted: stepsCompleted,
    spannedRTArray: spannedRTArray

  };

  const jsonString = JSON.stringify(combinedData, null, 2);
  return jsonString;
}

function loadStudySetFromLocalStorage() {
  const fileName = document.getElementById("set-select").value
  const jsonData = localStorage.getItem(fileName);
  const data = JSON.parse(jsonData)
  processJSONData(data);
}

function processJSONData(data) {
  document.getElementById("inputText").value = data.text;
  processedSentences = data.processedSentences;
  revisedSentences = data.revisedSentences;
  errorTags = data.errorTags;
  revisedVersionText = data.revisedVersionText;
  dsParagraph = data.dsParagraph;
  stepsCompleted = data.stepsCompleted;
  spannedRTArray = data.spannedRTArray;

  if (stepsCompleted[0] == 1) {
    loadText();
    document.getElementById('tabButtonStep1').click();
  }
  if (stepsCompleted[1] == 1) {
    showSenRevisionResult();
    loadErrorTags();
    document.getElementById('tabButtonStep2').click();
  }
  if (stepsCompleted[2] == 1) {
    document.getElementById('tabButtonStep3').click();
    startCorrectionPractice();
  }
  if (stepsCompleted[3] == 1) {
    document.getElementById('tabButtonStep4').click();
    startStep4();


    var select = document.getElementById('RtParagraphSelect')
    dsParagraph.forEach(function(paragraph, index) {
      var option = document.createElement('option');
      option.value = index
      option.text = "段落" + (index + 1)
      select.appendChild(option);
    })

    rvsnDoneIntrfceChange();
    goToParagraphStep4();;

  }
  if (stepsCompleted[4] == 1) {
    document.getElementById('tabButtonStep5').click();
    genExampleReading()
  }



}

function loadErrorTags() {
  for (i = 0; i < processedSentences.length; i++) {
    var cell = document.querySelector('[data-cell-index="' + i + '"]');
    var button = cell.querySelector("button");
    if (cell) {
      for (var j in errorTags[String(i)]) {
        select = document.createElement('select')
        modifySelectforErrorTag(select)
        select.value = errorTags[String(i)][j]
        cell.insertBefore(select, button);
      }
    }
  }
}

function listLocalStorage() {
  // Get the file names from local storage
  const fileNames = Object.keys(localStorage);

  // Populate the select element with file names
  const setSelect = document.getElementById('set-select');
  setSelect.innerHTML = "";

  if (fileNames.length == 0) {
    const option = document.createElement('option');
    option.value = 0
    option.text = "瀏覽器內無學習集"
    setSelect.appendChild(option);
  }
  fileNames.forEach(fileName => {
    if (fileName != "上次學習階段暫存") {
      const option = document.createElement('option');
      option.value = fileName;
      option.text = fileName;
      setSelect.appendChild(option);
    }
  });
}
//==================== miscellaneous ===========================================
function changeDivDisplay(id, displayValue) {
  document.getElementById(id).style.display = displayValue
}

function makeButtonRegular(id) {
  var element = document.getElementById(id);
  element.classList.remove('dominantButton');
  element.classList.add('regularButton');
}

function makeButtonDominant(id) {
  var element = document.getElementById(id);
  element.classList.remove('regularButton');
  element.classList.add('dominantButton');
}

function openTab(evt, tabName) {
  // Declare variables
  var i, tabcontent, tablinks;

  // Hide all tab content
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the "active" class from all tab links
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}


function removeAllElement(Id) {
  var container = document.getElementById(Id);

  if (container) {
    var elements = container.querySelectorAll("*");

    elements.forEach(function(element) {
      element.remove();
    });
  } else {
    console.log("element with specified container Id not found.")
  }
}

//==================== tab1 ===========================================
function clearText() {
  document.getElementById("inputText").value = ''
}


function loadText() {
  makeButtonRegular('loadTextButton')
  makeButtonDominant('correctArticleButton')
  document.getElementById('loadTextContainer').style.display = "none";
  document.getElementById('apiKeyContainer').style.display = "block";
  var inputText = document.getElementById("inputText").value.trim();
  const matchedSentences = inputText.match(/[^\.!\?]+[\.!\?]+/g);
  processedSentences = matchedSentences.map((sentence) => sentence.trim());

  var currentIndex = 0;
  for (var i = 0; i < inputText.length; i++) {
    if (inputText[i] === '\n') {
      newParagraph.push(currentIndex);
    }
    if (inputText[i] === '.' || inputText[i] === '!' || inputText[i] === '?') {
      currentIndex++;
    }
  }
  console.log(newParagraph)
  var container = document.getElementById('processedTextContainer')

  //display word count
  var wordCount = inputText.split(" ").length
  var wordCountP = document.createElement('p');
  wordCountP.innerHTML = "字數: " + wordCount + "字"
  container.appendChild(wordCountP)

  //display paragraph count
  var paragraphCount = newParagraph.length + 1
  var paragraphCountP = document.createElement('p');
  paragraphCountP.innerHTML = "段落數: " + paragraphCount + "段"
  container.appendChild(paragraphCountP)

  for (var i = 0; i < processedSentences.length; i++) {
    var loadResult = (i + 1) + ". " + processedSentences[i].trim();

    var sen = document.createElement('p');
    sen.innerHTML = loadResult;
    container.appendChild(sen)

  }
  document.getElementById('processedDisplay').style.display = "inline-block"

  saveProgress(1);
}

async function tab1ToTab2() {
  const apiKey = document.getElementById("APIkey").value;
  const level = "18-year-old"
  if (revising == true) {
    alert("文章已在批改中，請耐心等候");
    return;
  }

  if (!apiKey) {
    alert('請輸入API金鑰.');
    return;
  }


  revising = true;

  //set sys/user/asst parameter

  const sysContent = "You are teaching English writing to adult learners. Assume that the learners have life experience and understand adult topics, but their language abilities are equivalent to a" + level + ". Please use level-appropriate language.";
  const userContent = "You are teaching English writing to adult learners with life experience and understand adult topics, but their language abilities are equivalent to a" + level + "\nPlease check the following sentences. Correct the grammar and lexical errors if found. If there are no grammatical or lexical error in a sentence, don't make any changes. \n1. He is a good boy.\n2. He plays games with his frinds"
  const astContent = "Sure.\n1. He is a good boy. \n2. He plays games with his friends"
  const temp = 0.1

  var oriSenSet = ""
  for (i = 0; i < processedSentences.length; i++) {
    oriSenSet = oriSenSet + "\n" + (i + 1) + ". " + processedSentences[i];
  }
  const prompt = "You are teaching English writing to adult learners with life experience and understand adult topics, but their language abilities are equivalent to a" + level + "\nPlease check the following sentences. Correct the grammar and lexical errors if found. If there are no grammatical or lexical error in a sentence, don't make any changes.\n" + oriSenSet

  console.log(prompt)



  //send prompt
  try {
    document.getElementById('correctingMessage').style.display = "block"
    const result = await sendPrompt(prompt, sysContent, userContent, astContent, temp);
    console.log(result)
    revisedSentences = result.split(/\n\d+\.\s/).filter(sentence => sentence.trim() !== '');
    revisedSentences.shift();
    showSenRevisionResult();
    document.getElementById('tabButtonStep2').click()
    document.getElementById('correctingMessage').style.display = "none"
    saveProgress(2);




  }
  catch (error) {
    // Handle the error here
    console.error(error);
  }
}
//==================== tab2 ===========================================
function showSenRevisionResult() {
  var tableBody = document.querySelector("#comparison-table tbody");
  tableBody.innerHTML = ""; // Clear any existing rows in the table

  var dmp = new diff_match_patch();

  for (var i = 0; i < processedSentences.length; i++) {
    var originalSentence = processedSentences[i].trim();
    var revisedSentence = revisedSentences[i].trim();

    // Generate the differences between the original and revised sentences
    var diffs = dmp.diff_main(originalSentence, revisedSentence);
    dmp.diff_cleanupSemantic(diffs);
    var ds = dmp.diff_prettyHtml(diffs);

    // Create table row
    var row = document.createElement("tr");

    // Create table cells for original and revised sentences
    var originalCell = document.createElement("td");
    var revisedCell = document.createElement("td");

    originalCell.innerHTML = originalSentence;
    revisedCell.innerHTML = ds;

    // Append cells to the row
    row.appendChild(originalCell);
    row.appendChild(revisedCell);

    // Create the tag cell with the Add Tag button and select element
    var tagCell = document.createElement("td");

    // Create the Add Tag button

    var addButton = document.createElement("button");
    addButton.classList.add('dominantButton')
    addButton.style.padding = "1px";
    addButton.style.width = "20px";
    addButton.style.height = "20px";
    addButton.textContent = "+";
    addButton.style.marginTop = "10px"
    addButton.addEventListener("click", function() {
      addTag(this); // "this" refers to the button element that was clicked
    });

    tagCell.appendChild(addButton);


    // Set the custom attribute for the tag cell
    tagCell.setAttribute("data-cell-index", i);

    // Append the tag cell to the row
    row.appendChild(tagCell);

    // Append the row to the table body
    tableBody.appendChild(row);
  }
  displayOriSen()
}

function displayOriSen() {
  const comparisonTable = document.getElementById("comparison-table");
  const rows = comparisonTable.getElementsByTagName("tr");
  if (columnHidden) {
    document.getElementById("toggleColumnButton").innerHTML = "隱藏原始句子";
  } else {
    document.getElementById("toggleColumnButton").innerHTML = "顯示原始句子";
  }

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    if (cells.length > 0) {
      if (columnHidden) {
        cells[0].style.display = "";
      } else {
        cells[0].style.display = "none";
      }
    }

    // Additional check for the header row
    if (i === 0) {
      const headerCells = rows[i].getElementsByTagName("th");
      if (headerCells.length > 0) {
        if (columnHidden) {
          headerCells[0].style.display = "";
        } else {
          headerCells[0].style.display = "none";
        }
      }
    }
  }

  columnHidden = !columnHidden;
}


function addTag(button) {
  var cell = button.parentNode; // Get the parent cell of the button
  var select = document.createElement('select'); // Create new <select> element
  modifySelectforErrorTag(select);
  cell.insertBefore(select, button);
  saveTags();
}

function modifySelectforErrorTag(select) {
  select.addEventListener("change", function() {
    // Get the selected value
    var selectedValue = select.value;

    // Specify the value to check against
    var specifiedValue = "無";

    // Check if the selected value matches the specified value
    if (selectedValue === specifiedValue) {
      // Remove the select element from the document
      select.parentNode.removeChild(select);
    }
    saveTags();

  })
  var options = ["無", "句型結構", "動詞型態", "單字位置", "單複數", "冠詞", "介係詞", "標點符號", "詞性", "拼字", "用字不佳", "贅字"];
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement("option");
    option.text = options[i];
    select.appendChild(option);
  }
  select.value = "動詞型態"
  select.style.fontSize = "large"
  select.classList.add('errorTag')
}

function saveTags() {
  var table = document.getElementById('comparison-table')
  var selectElements = table.querySelectorAll(".errorTag");
  errorTags = {}
  selectElements.forEach(function(selectElement) {
    var cell = selectElement.closest("td");
    var cellIndex = cell.getAttribute("data-cell-index"); // Custom attribute
    var selectedValue = selectElement.value;

    if (!errorTags[cellIndex]) {
      errorTags[cellIndex] = [];
    }

    errorTags[cellIndex].push(selectedValue);
  });
  for (var key in errorTags) {
    if (Object.prototype.hasOwnProperty.call(errorTags, key)) {
      console.log(errorTags[key]);
    }
  }
  saveProgress(2);
}


async function sendPrompt(prompt, sysContent, userContent, astContent, temperature) {
  const apiKeyElement = document.getElementById("APIkey");
  const apiKey = apiKeyElement.value;
  const progress = document.getElementById('progress');

  try {
    console.log("prompt Sent")
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          { role: 'system', content: sysContent },
          { role: 'user', content: userContent },
          { role: 'assistant', content: astContent },
          { role: 'user', content: prompt },
        ],
        temperature: temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = new Error('Error: ' + response.status + ' ' + response.statusText);
      throw error;
    }

    const json = await response.json();
    const result = json.choices[0].message.content;
    return result;
  } catch (error) {
    alert(error);
  }
}

//==================== tab3 ===========================================
function startCorrectionPractice() {
  makeButtonDominant('checkInputButton')
  //initialize interface
  document.getElementById('correctionContainer').style.display = 'block'
  document.getElementById('startCorrectionButton').style.display = 'none'
  document.getElementById('correctionInput').value = processedSentences[0].trim()

  //populate select element
  senSelect = document.getElementById('senSelect');
  processedSentences.forEach((element, index) => {
    var option = document.createElement('option');
    option.value = index
    var words = element.split(' ').slice(0, 4);
    var text = words.join(' ');
    option.text = text + "...";
    senSelect.appendChild(option);
  });


  //generate hint
  var oriSenHighlighted = highlightDiff(0)
  document.getElementById('hint').innerHTML = oriSenHighlighted

  populateErrorTags(0);
  saveProgress(3);

}

function populateErrorTags(index) {
  tagContainer = document.getElementById('tagContainer')
  removeAllElement('tagContainer');
  if (errorTags[String(index)]) {
    errorTags[String(index)].forEach(tagText => {

      const tag = document.createElement("div");
      tag.className = "tag";
      tag.textContent = tagText;
      tagContainer.appendChild(tag);

    });
  }
}

function showHint() {
  var hintContainer = document.getElementById("hintContainer");
  if (hintContainer.style.display === "none") {
    hintContainer.style.display = "block";
  } else {
    hintContainer.style.display = "none";
  }
}


function highlightDiff(index) {
  var originalSentence = processedSentences[index].trim();
  var revisedSentence = revisedSentences[index].trim();
  var dmp = new diff_match_patch();
  var diffs = dmp.diff_main(originalSentence, revisedSentence);
  dmp.diff_cleanupSemantic(diffs);

  var highlightedSentence = "";

  for (var i = 0; i < diffs.length; i++) {
    var diff = diffs[i];
    var text = diff[1];

    if (diff[0] === 0) {
      // No change, add the text as it is
      highlightedSentence += text + " ";
    } else if (diff[0] === -1) {
      // Deletion, add the text wrapped in a span with red color
      highlightedSentence += '<span style="color: red; text-decoration: line-through;">' + text + '</span> ';
    } else if (diff[0] === 1) {
      // Addition, add the text wrapped in a span with green color
      highlightedSentence += '<span style="color: green;">___</span> ';
    }
  }
  return highlightedSentence;
}

function checkCorrection() {
  document.getElementById('checkInputButton').style.display = "none";
  document.getElementById('correctionInput').style.border = "1px solid black";

  var correctionInput = document.getElementById('correctionInput').value.trim();
  var revisedSentence = revisedSentences[currentCorrectionIndex].trim();
  var dmp = new diff_match_patch();
  var diffs = dmp.diff_main(correctionInput, revisedSentence);
  dmp.diff_cleanupSemantic(diffs);
  var ds = dmp.diff_prettyHtml(diffs);
  document.getElementById('checkResult').innerHTML = ds;
  document.getElementById('checkResultContainer').style.display = "block"
  document.getElementById('afterCheckContainer').style.display = "block";
  window.scrollTo(0, document.body.scrollHeight);
}

function retryCorrection() {
  document.getElementById('hintContainer').style.display = "none";
  document.getElementById('checkResult').innerHTML = "";
  document.getElementById('correctionInput').value = processedSentences[currentCorrectionIndex].trim()
  document.getElementById('afterCheckContainer').style.display = "none";
  document.getElementById('checkInputButton').style.display = "inline-block";
  document.getElementById('correctionInput').style.border = "1px solid #ffb74b";
  document.getElementById('checkResultContainer').style.display = "none"
}

function nextSentence() {
  if (currentCorrectionIndex == processedSentences.length - 1) {
    alert('這是最後一個句子了，請點選步驟4')
    return;
  }
  currentCorrectionIndex++;
  document.getElementById('senSelect').selectedIndex = currentCorrectionIndex
  iniSenCorrection();
  populateErrorTags(currentCorrectionIndex)
  document.getElementById('correctionInput').style.border = "1px solid #ffb74b";
  document.getElementById('checkResultContainer').style.display = "none"
}

function changeSen() {
  senSelect = document.getElementById('senSelect');
  currentCorrectionIndex = senSelect.value;
  iniSenCorrection();
  populateErrorTags(currentCorrectionIndex)

}

function iniSenCorrection() {
  document.getElementById('hintContainer').style.display = "none";
  document.getElementById('checkResult').innerHTML = "";
  document.getElementById('afterCheckContainer').style.display = "none";
  document.getElementById('checkInputButton').style.display = "inline-block";
  document.getElementById('correctionInput').value = processedSentences[currentCorrectionIndex].trim()
  var oriSenHighlighted = highlightDiff(currentCorrectionIndex)
  document.getElementById('hint').innerHTML = oriSenHighlighted
}

//==================== tab4 ===========================================

function startStep4() {
  document.getElementById('startStep4Button').style.display = "none";
  document.getElementById('TextpreviewContainer').style.display = "block";
  document.getElementById('startRevision').style.display = "block";

  modifiedText = createPassage(revisedSentences, newParagraph)
  modifiedTextArray = modifiedText.split('\n\n')
  modifiedTextHTML = modifiedText.replace(/\n/g, "<br>")
  document.getElementById('modifiedText').innerHTML = modifiedTextHTML;
}

function createPassage(sentences, newParagraph) {
  var passage = '';

  for (var i = 0; i < sentences.length; i++) {
    if (newParagraph.includes(i)) {
      passage += '\n\n';
    }
    passage += sentences[i].trim() + ' ';
  }
  return passage.trim();
}

async function startRevision() {

  const sysContent = "You are teaching English writing to adult learners. Assume that the learners have life experience and understand adult topics, but their language abilities are equivalent to a 18 year-old. Please use level-appropriate language.";
  const userContent = "Please provide a revised version for the text below: \nAs a resident of Taiwan, based on my own observations, I think the people and landscapes here are features that we should be proud of. Visitors from other countries usually associate the passion of Taiwanese people and are impressed by the landscapes on this tiny island. For instance, there are volcanoes and tall mountains that you can visit in a day. As for my friends' feelings about the people here, most of the responses are warm vibes while they talk to the locals.\nWhat can we do to introduce Taiwan to the world? There are several youtubers who travel around the world and also introduce the wonderful homeland to foreigners. However, what else can we do to also let the world knows that there’s still a beautiful island on earth, we can just be proud to say where we came from when we are abroad. What a simple action, however, the person that you talking to will be influenced by the words you said. That’s because the speech and the thoughts come from your heart, you’re introducing Taiwan due to the passion and love of this nation.\nIn conclusion, the landscape and the people here are the features which make Taiwan unique. Only talk about the homeland where you came from, I’d believe that there will have more visitors travelling to Taiwan owing to your passion and how excited when you talk about it."
  const astContent = "Revised version:\nAs a resident of Taiwan, I take pride in the remarkable people and landscapes of this country. Visitors are often impressed by the passion of Taiwanese people and the stunning scenery on this small island. One can explore volcanoes and tall mountains in just a day. My friends have also had warm interactions with locals and felt a positive vibe.\n\nTo promote Taiwan globally, some YouTubers travel the world and showcase our wonderful homeland to foreigners. However, we can do more to raise awareness about this beautiful island. When we are abroad, we can proudly mention our origin. This simple action can have a significant impact, as our words and thoughts reflect our passion and love for Taiwan.\n\nIn conclusion, Taiwan's unique features lie in its landscapes and people. By passionately talking about our homeland, we can inspire more visitors to come and experience Taiwan firsthand."
  const temp = 0.5
  const prompt = "Please provide a revised version for the text below:\n" + modifiedText

  console.log(prompt)

  //send prompt
  try {
    document.getElementById('correctingMessageStep4').style.display = "block"
    const result = await sendPrompt(prompt, sysContent, userContent, astContent, temp);
    console.log(result);
    const revisedVersionIndex = result.indexOf('Revised version:');
    revisedVersionText = result.substring(revisedVersionIndex + 'Revised version:'.length).trim();
    var MtParagraphs = modifiedText.split("\n\n");
    var RtParagraphs = revisedVersionText.split("\n\n");
    dsParagraph.length = 0
    RtParagraphs.forEach(function(paragraph, index) {
      var dmp = new diff_match_patch();
      var diffs = dmp.diff_main(MtParagraphs[index], paragraph);
      dmp.diff_cleanupSemantic(diffs);
      var ds = dmp.diff_prettyHtml(diffs);
      dsParagraph.push(ds);
      var select = document.getElementById('RtParagraphSelect')
      var option = document.createElement('option');
      option.value = index
      option.text = "段落" + (index + 1)
      select.appendChild(option);
    });
    document.getElementById('correctingMessageStep4').style.display = "none"
    rvsnDoneIntrfceChange();
    goToParagraphStep4();;
    saveProgress(4);




  }
  catch (error) {
    // Handle the error here
    console.error(error);
  }



}

function rvsnDoneIntrfceChange() {
  document.getElementById('startRevision').style.display = "none";
  document.getElementById('modifiedText').style.display = "none";
  document.getElementById('dispModifiedText').style.display = "inline-block";
  document.getElementById('revisedVersionContainer').style.display = "block";
  document.getElementById('TextpreviewContainer').style.display = "none";
  document.getElementById('RtParagraphSelect').value = 0
}

function dispOriText() {
  modifiedText = document.getElementById('modifiedText')
  dispModifiedText = document.getElementById('dispModifiedText')
  if (oriTextHidden) {
    modifiedText.style.display = "";
    dispModifiedText.innerHTML = "隱藏修改前段落"
  } else {
    modifiedText.style.display = "none";
    dispModifiedText.innerHTML = "顯示修改前段落"
  }
  oriTextHidden = !oriTextHidden

}

function goToParagraphStep4() {
  index = document.getElementById('RtParagraphSelect').value
  document.getElementById('RtParagraph').innerHTML = dsParagraph[index];
  document.getElementById('modifiedText').innerHTML = modifiedTextArray[index];
}

//==================== tab5 ===========================================

function goToParagraphStep5() {
  var index = document.getElementById('duplicatedSelect').value
  document.getElementById('modifiedText').innerHTML = modifiedTextArray[index];
  const spannedText = document.getElementById('spannedText');
  spannedText.innerHTML = spannedRTArray[index];
  const spanElements = spannedText.querySelectorAll("#spannedText span");
  spanElements.forEach(span => {
    span.addEventListener("click", event => highlightSpan(event));
  });
}

function highlightSpan(event) {
  const span = event.target;
  const currentIndex = document.getElementById('duplicatedSelect').value
  const spannedText = document.getElementById('spannedText');
  if (span.classList.contains("highlighted")) {
    // Remove highlight
    span.classList.remove("highlighted");
  } else {
    // Add highlight
    span.classList.add("highlighted");

  }
  spannedRTArray[currentIndex] = spannedText.innerHTML
  saveProgress(5);
}

function genExampleReading() {
  document.getElementById('practiceSettingsContainer').style.display = "block";
  var revisedVersionTextArray = revisedVersionText.split("\n\n");
  document.getElementById('exPassageContainer').style.display = "block";
  document.getElementById('startReadingButton').style.display = "none";

  for (i = 0; i < revisedVersionTextArray.length; i++) {
    var words = revisedVersionTextArray[i].split(" ");
    var spannedRT = words.map((word, index) => {
      return `<span id="word${index + 1}" >${word}</span>`;
    }).join(" ");
    spannedRTArray.push(spannedRT);
  }
  duplicateSelectOption();
  goToParagraphStep5()
  window.scrollTo(0, document.body.scrollHeight)

}

function replaceHighlightedSpans(ID) {
  const div = document.getElementById(ID);
  const highlightedSpans = div.getElementsByClassName("highlighted");
  const highlightedArray = Array.from(highlightedSpans);
  TUArray.length = 0;
  for (let i = 0; i < highlightedArray.length; i++) {
    const span = highlightedArray[i];
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    //inputElement.value = span.textContent;

    // Calculate width based on span's text length
    const textLength = span.textContent.length;
    const minWidth = 30; // Minimum width in pixels
    const width = Math.max(minWidth, textLength * 8); // Adjust the multiplier as needed

    inputElement.style.width = `${width}px`; // Set the width dynamically

    TUArray.push(span.textContent); // Push original text content to the array

    span.parentNode.replaceChild(inputElement, span);
  }
}

function startRewrite() {

  const settings = JSON.parse(getChoices());
  //setup fill in the blanks practice
  if (settings["inputContent"] == 2) {
    document.getElementById('blankedExPassage').innerHTML = document.getElementById('spannedText').innerHTML
    replaceHighlightedSpans('blankedExPassageContainer');
    changeDivDisplay('blankedExPassageContainer', 'block')
    changeDivDisplay('exPassageContainer', 'none')
    changeDivDisplay('practiceSettingsContainer', 'none')
  } else {
    loadTargetUsage(settings["hintType"]);
    loadInputContent(settings["inputContent"]);
    //document.getElementById('exPassageContainer').style.display = "none"
    document.getElementById('practiceSettingsContainer').style.display = "none"
    document.getElementById('rewriteElementsContainer').style.display = "block"
    document.getElementById('compareResult').innerHTML = ""
    //window.scrollTo(0, document.body.scrollHeight/2);
    makeButtonDominant('compareButton');
    makeButtonRegular('returnButtonRewrite')
    changeDivDisplay('exPassageContainer', 'none');
  }
}

function loadInputContent(inputContent) {
  const input = document.getElementById('UserInputStep5')
  input.value = ""
  if (inputContent == "1") {
    index = document.getElementById('duplicatedSelect').value
    input.value = modifiedTextArray[index];
  }
}

function loadTargetUsage(hintType) {
  // Retrieve elements with the class "highlighted"
  var highlightedElements = document.querySelectorAll('.highlighted');
  console.log(highlightedElements)
  var highlightedTextContent = [];
  for (var i = 0; i < highlightedElements.length; i++) {
    var element = highlightedElements[i];
    var textNoPunc = element.textContent.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, "");
    highlightedTextContent.push(textNoPunc);
  }
  console.log(highlightedTextContent)
  var highlightedElementsBlanked = []
  for (i = 0; i < highlightedTextContent.length; i++) {
    var elementblanked = replaceEvenCharacters(highlightedTextContent[i], "_")
    highlightedElementsBlanked.push(elementblanked);
  }
  // Initialize an array to store the IDs of the highlighted elements
  var highlightedIDs = [];

  // Iterate over the retrieved elements
  highlightedElements.forEach((element) => {
    // Get the ID of each highlighted element
    var elementID = element.id;
    highlightedIDs.push(elementID);
  });


  var targetUsageElement = []
  var spacing = ""
  if (hintType == "blanked") {
    targetUsageElement = highlightedElementsBlanked
    spacing = "&nbsp;&nbsp;&nbsp;"
  } else {
    targetUsageElement = highlightedTextContent
    spacing = " "
  }

  var targetUsage = document.getElementById('targetUsage');
  var targetUsageText = ""


  // Iterate over the retrieved elements (assuming they are in order)
  for (var i = 0; i < highlightedIDs.length; i++) {
    // Get the IDs of the current and next highlighted elements
    var currentID = highlightedIDs[i];
    if ((i + 1) == highlightedIDs.length) {
      targetUsageText = targetUsageText + targetUsageElement[i]
      break;
    }
    var nextID = highlightedIDs[i + 1];

    // Extract the word indices from the IDs
    var currentWordIndex = parseInt(currentID.replace('word', ''));
    var nextWordIndex = parseInt(nextID.replace('word', ''));

    // Check if the word indices are adjacent
    if (nextWordIndex !== currentWordIndex + 1) {
      targetUsageText += targetUsageElement[i] + " / "
    } else {
      targetUsageText += targetUsageElement[i] + spacing
    }

  }
  targetUsage.innerHTML = targetUsageText
}

function replaceEvenCharacters(word, replacement) {
  var replacedWord = '';

  for (var i = 0; i < word.length; i++) {

    if (i == 0) {
      replacedWord += word[i];
    } else if (i % 2 === 0) {
      replacedWord += replacement;
    } else {
      replacedWord += word[i];
    }
  }

  return replacedWord;
}

function duplicateSelectOption() {
  var originalSelect = document.getElementById("RtParagraphSelect");

  // Create a new select element
  var duplicatedSelect = document.getElementById("duplicatedSelect");

  // Copy options from the original select element
  for (var i = 0; i < originalSelect.options.length; i++) {
    var option = document.createElement("option");
    option.value = originalSelect.options[i].value;
    option.text = originalSelect.options[i].text;
    duplicatedSelect.appendChild(option);
  }
  duplicatedSelect.value = 0

}

function getChoices() {
  var questions = {
    hintType: "",
    inputContent: ""
  };

  var questionNames = Object.keys(questions);

  for (var i = 0; i < questionNames.length; i++) {
    var questionName = questionNames[i];
    var checkedOption = document.querySelector('input[name="' + questionName + '"]:checked');

    if (checkedOption) {
      questions[questionName] = checkedOption.value;
    } else {
      questions[questionName] = "No option selected";
    }
  }
  var questionsJSON = JSON.stringify(questions)
  return questionsJSON;
}

function compareToExPassage() {
  var index = document.getElementById('duplicatedSelect').value
  var revisedVersionTextArray = revisedVersionText.split("\n\n")
  var input = document.getElementById('UserInputStep5')
  var inputText = input.value
  var dmp = new diff_match_patch();
  var diffs = dmp.diff_main(inputText, revisedVersionTextArray[index]);
  dmp.diff_cleanupSemantic(diffs);
  var ds = dmp.diff_prettyHtml(diffs);
  document.getElementById('compareResult').innerHTML = ds
  changeDivDisplay('compareResultContainer', 'block')
  window.scrollTo(0, document.body.scrollHeight)
  makeButtonRegular('compareButton')
  makeButtonDominant('returnButton')
}

function showPracticeOptions() {

  changeDivDisplay('exPassageContainer', 'block')
  changeDivDisplay('practiceSettingsContainer', 'block');
  changeDivDisplay('rewriteElementsContainer', 'none');
  changeDivDisplay('compareResultContainer', 'none')
  changeDivDisplay('blankedExPassageContainer', 'none')

}

function checkBlanks() {
  const container = document.getElementById("blankedExPassageContainer");
  const inputs = container.querySelectorAll("input[type='text']");

  for (let i = 0; i < inputs.length; i++) {
    const inputElement = inputs[i];
    const inputValue = inputElement.value
    const correctAnswerValue = TUArray[i]

    if (inputValue === correctAnswerValue) {
      // Correct input
      inputElement.style.backgroundColor = "green";
    } else {
      // Incorrect input
      inputElement.style.backgroundColor = "yellow";
      inputElement.style.textDecoration = "line-through";

      const correctAnswer = document.createElement("span");
      correctAnswer.style.color = "red";
      correctAnswer.textContent = "(" + correctAnswerValue + ")";
      inputElement.parentNode.insertBefore(correctAnswer, inputElement.nextSibling);
    }
  }
}

//============================= StudySet Manager =========================================
function tableLocalStorageFiles() {
  var fileTable = document.getElementById("fileTable");
  var files = Object.keys(localStorage);

  while (fileTable.rows.length > 1) {
    fileTable.deleteRow(1);
  }

  for (var i = 0; i < files.length; i++) {
    var row = fileTable.insertRow(i + 1);
    var selectCell = row.insertCell(0);
    var fileNameCell = row.insertCell(1);

    fileNameCell.innerHTML = files[i];
    selectCell.innerHTML = '<input type="checkbox" name="fileCheckbox" value="' + files[i] + '">';
  }
}


function deleteSelectedFiles() {
  var checkboxes = document.getElementsByName("fileCheckbox");
  var selectedFiles = [];

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedFiles.push(checkboxes[i].value);
    }
  }

  for (var i = 0; i < selectedFiles.length; i++) {
    localStorage.removeItem(selectedFiles[i]);
  }

  // Clear the table and re-list the files
  var fileTable = document.getElementById("fileTable");
  fileTable.innerHTML = '<tr><th>選取</th><th>學習集名稱</th></tr>';
  tableLocalStorageFiles();
}