getTests()

// получить тесты
function getTests() {
  fetch("http://localhost:8080/tests")
    .then(res => res.json())
    .then(tests => {
      const testsHtml = tests.reduce((acc, test) => {
        return (acc +=
          `<div class="card test">
            <div class="card-body">
              <a 
                href="#" class="link-primary test"
                data-testid="${test.testId}"
                data-testtitle="${test.testTitle}">
                  ${test.testTitle}
              </a>
              <div class="card-buttons">
                <button data-edittestid="${test.testId}" class="btn btn-outline-primary card-small-btn btn-card_edit">
                  <span data-edittestid="${test.testId}" class="material-symbols-sharp card-small-btn_icon">
                    edit
                  </span></button>
                <button data-deletetestid="${test.testId}" class="btn btn-outline-primary card-small-btn btn-card_edit">
                  <span data-deletetestid="${test.testId}" class="material-symbols-sharp card-small-btn_icon">
                    delete
                  </span>
                </button>
              </div>
            </div>
          </div>`)
      }, "")
      document.getElementById("tests").innerHTML = testsHtml
    })
}

// Отправить тест
function submitTest(test) {
  fetch('http://localhost:8080/tests', {
    method: 'POST',
    body: JSON.stringify(test),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      getTests()
    });
}

// Удалить тест
function deleteTest(idTest) {
  fetch('http://localhost:8080/tests/' + idTest, {
    method: "DELETE",
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      if (json) {
        getTests()
      }
    });
}


const modalEditor = document.querySelector(".modal-edit-test")
const modalTitle = modalEditor.querySelector(".modal-title")
const questionsBlock = modalEditor.querySelector(".new-questions")
const btnNewQuestion = modalEditor.querySelector("#btn-edit-question")

function editorForTest(idTest) {

  fetch('http://localhost:8080/tests/' + idTest)
    .then(res => res.json())
    .then(json => {
      questionsBlock.innerHTML = ""

      btnNewQuestion.addEventListener("click", newQuestionHandler)
      function newQuestionHandler() {
        const newQuestion = document.createElement("div")
        newQuestion.classList.add("question")
        const questionHTML =
          `
          <h5 class="question-title">Вопрос ${++countQuestions}</h5>
            <input type="text" class="question-text form-control">

            <div class="answers">

            <div class="answer">
              <input type="radio" class="form-check-input" name="a${countQuestions}">
              <input type="text" class="form-control">
            </div>
      
            <div class="answer">
              <input type="radio" class="form-check-input" name="a${countQuestions}">
              <input type="text" class="form-control">
            </div>
      
            <div class="answer">
              <input type="radio" class="form-check-input" name="a${countQuestions}">
              <input type="text" class="form-control">
            </div>
      
            <div class="answer">
              <input type="radio" class="form-check-input" name="a${countQuestions}">
              <input type="text" class="form-control">
            </div>
          </div>
          `
        newQuestion.innerHTML = questionHTML
        questionsBlock.append(newQuestion)
      }

      let countQuestions = json.questions.length

      modalTitle.innerHTML = json.title

      json.questions.forEach((q, i) => {
        questionsBlock.append(createElEditorQuestion(q, i))
      });

      modalEditor.classList.add("modal-show")

      const btnSubmitTest = modalEditor.querySelector("#submit-test")
      modalEditor.querySelector("#test-title").value = ""



      function submitHandler() {
        const testTitle = modalEditor.querySelector("#test-title").value

        // modalEditor.querySelector(".modal-title").innerHTML
        const questionsNodes = modalEditor.querySelectorAll(".question")

        let testObjEdit = {
          title: testTitle ? testTitle : json.title,
          questions: []
        }

        questionsNodes.forEach(q => {
          const questionText = q.querySelector(".question-text").value
          // console.log(q)
          let questionObjEdit = {
            textQuestion: questionText,
            answers: []
          }

          const answerBlocks = q.querySelectorAll(".answers")
          answerBlocks.forEach(aEl => {
            const answers = aEl.querySelectorAll("div")
            const as = answers.forEach(a => {
              const isCorrectA = a.querySelector("[type=radio]").checked
              const textA = a.querySelector("[type=text]").value
              const answerObjEdit = {
                isCorrect: isCorrectA,
                textAnswer: textA
              }

              questionObjEdit.answers.push(answerObjEdit)
            })
          })

          testObjEdit.questions.push(questionObjEdit)
        })

        editTest(idTest, testObjEdit)
        closeEditModal()
      }

      function closeEditModal() {
        modalEditor.classList.remove("modal-show")
        btnNewQuestion.removeEventListener("click", newQuestionHandler)
        btnSubmitTest.removeEventListener("click", submitHandler)
      }

      btnSubmitTest.addEventListener("click", submitHandler)

      modalEditor.querySelector(".modal-btn_close")
        .addEventListener("click", () => {
          closeEditModal()
        })
    })
}

const initQuestion = {
  textQuestion: "",
  answers: []
}
function createElEditorQuestion(question = initQuestion, i = 1) {
  let el = document.createElement("div")
  el.classList.add("question")

  const questionHTML =
    `
    <h5 class="question-title">Вопрос ${i + 1}</h5>
      <input type="text" class="question-text form-control" 
             value="${question.textQuestion}">

      <div class="answers">${question.answers.reduce((acc, a) => {
      return acc += createElEditorAnswer(a, i)
    }, "")}</div>
    </div>
    `
  el.innerHTML = questionHTML

  return el
}

const initAnswer = {
  answerId: 1,
  isCorrect: false,
  textAnswer: ""
}
function createElEditorAnswer(answer = initAnswer, i = 1) {
  const answerHTML =
    `
    <div class="answer">
      <input type="radio" 
             class="form-check-input" 
             name="a${i}"
             ${answer.isCorrect ? "checked" : ""}>
      <input type="text" 
             value="${answer.textAnswer}" class="form-control">
    </div>
    `
  return answerHTML
}

// Отредактировать тест
function editTest(idTest, testObj) {
  fetch('http://localhost:8080/tests/' + idTest, {
    method: "PUT",
    body: JSON.stringify(testObj),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json)
      if (json) {
        getTests()
      }
    });
}

// получить тест, и пройти его
function getTest(idTest, modalWindow) {
  let currentQuestion = 0
  let errorsCount = 0
  let correctCount = 0

  const blockQuestionText = modalWindow.querySelector(".test-question")
  const blockAnswers = modalWindow.querySelector(".test-answers")

  const blockInfo = modalWindow.querySelector(".block-info")
  const blockCurentNumber = modalWindow.querySelector(".number-current")
  const blockTotalQuestions = modalWindow.querySelector(".number-total")
  const blockErrors = modalWindow.querySelector(".number-error")

  blockInfo.classList.remove("block-info_hidden")

  fetch("http://localhost:8080/tests/" + idTest)
    .then(res => res.json())
    .then(test => {
      showQuestion(test.questions, currentQuestion)

      blockAnswers.addEventListener("click", blockAnswersHandler)

      function blockAnswersHandler(e) {
        if (e.target.classList.contains("btn-answer")) {
          const idAnswer = e.target.dataset.answer

          fetch("http://localhost:8080/answer/" + idAnswer)
            .then(res => res.json())
            .then(isCorrect => {
              isCorrect ? correctCount++ : errorsCount++
              currentQuestion++
              if (currentQuestion + 1 > test.questions.length) {
                const finishTestMsg =
                  `
                  <div class="test-finished">
                    <h3>Поздравляем!</h3>
                    <h4>Вы прошли тест</h4>
                    <p>Правильных ответов:
                      <span class="number-correct">${correctCount}</span>
                    </p>
                    <p>Неправильных ответов:
                      <span class="number-error-container">${errorsCount}</span>
                    </p>
                  </div>
                  `
                blockQuestionText.innerHTML = finishTestMsg
                blockAnswers.innerHTML = ""
                blockInfo.classList.add("block-info_hidden")
                blockAnswers.removeEventListener("click", blockAnswersHandler)
              } else showQuestion(test.questions, currentQuestion)
            })
        }
      }
    })

  function showQuestion(questions, currentQuestion) {
    console.log(currentQuestion, questions.length)

    blockCurentNumber.innerHTML = currentQuestion + 1
    blockTotalQuestions.innerHTML = questions.length
    blockErrors.innerHTML = errorsCount

    blockQuestionText.innerHTML = questions[currentQuestion].textQuestion

    let htmlButtons = questions[currentQuestion].answers.reduce((acc, a) => {
      return (acc += `<button data-answer="${a.answerId}" 
                              class="btn-answer btn btn-outline-dark">
                        ${a.textAnswer}
                      </button> `)
    }, "")
    blockAnswers.innerHTML = htmlButtons
  }
}
