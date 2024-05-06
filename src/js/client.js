import React, { useState, useRef, forwardRef } from "react";
import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import { AudioPlayer } from './audio_player.js';
import voices from '../announce_voices.json';
import contents from '../contents.json';

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getExams = (size) => {
  const con = structuredClone(contents);
  var result = [];
  for (let i = 0; i < size; i++) {
    const j = getRandomInt(i + 1, con.length);
    [con[i], con[j]] = [con[j], con[i]];
    result.push(getShuffledExercise(con[i]));
  }
  return result;
}

const getShuffledExercise = (content) => {

  const swap_map = {
    "1": {  // (A, B, C) => (A, B, C)
      "A": "A",
      "B": "B",
      "C": "C"
    },
    "2": {  // (A, B, C) => (A, C, B)
      "A": "A",
      "B": "C",
      "C": "B"
    },
    "3": {  // (A, B, C) => (B, A, C)
      "A": "B",
      "B": "A",
      "C": "C"
    },
    "4": {  // (A, B, C) => (B, C, A)
      "A": "B",
      "B": "C",
      "C": "A"
    },
    "5": {  // (A, B, C) => (C, A, B)
      "A": "C",
      "B": "A",
      "C": "B"
    },
    "6": {  // (A, B, C) => (C, B, A)
      "A": "C",
      "B": "B",
      "C": "A"
    }
  };
  var swap = swap_map[getRandomInt(1, 6)];
  
  return {
    "ID": content['ID'],
    "Question": content['Question'],
    "AnswerA": content['Answer' + swap["A"]],
    "AnswerB": content['Answer' + swap["B"]],
    "AnswerC": content['Answer' + swap["C"]],
    "CorrectAnswer": swap[content['CorrectAnswer']],
    "Voices": {
      "US": {
          "Question": content['Voices']['US']['Question'],
          "AnswerA": content['Voices']['US']['Answer' + swap["A"]],
          "AnswerB": content['Voices']['US']['Answer' + swap["B"]],
          "AnswerC": content['Voices']['US']['Answer' + swap["C"]]
      },
      "IN": {
          "Question": content['Voices']['IN']['Question'],
          "AnswerA": content['Voices']['IN']['Answer' + swap["A"]],
          "AnswerB": content['Voices']['IN']['Answer' + swap["B"]],
          "AnswerC": content['Voices']['IN']['Answer' + swap["C"]]
      }
    }
  };
};

const ToeicApp = () => {
  const [exams, setExams] = useState();
  const [currentExamNumber, setCurrentExamNumber] = useState();
  const [correctCount, setCorrectCount] = useState(0);
  const [player, setPlayer] = useState(new AudioPlayer(voices, 'US'));
  const [result, setResult] = useState();

  const get_result = () => {
    const rate = Math.round(1000 * correctCount / exams.length) / 1000;
    let voice;
    let message;
    if (rate === 1) {
      voice = 'perfect';
      message = 'Perfect!!';
    }
    else if(rate >= 0.9) {
      voice = 'excellent'
      message = 'Excellent!'
    }
    else if (rate >= 0.7) {
      voice = 'welldone';
      message = 'Well done!'
    }
    else {
      voice = 'go_for_it';
      message = 'Go for it!';
    }

    return {
      'correctCount': correctCount,
      'examsCount': exams.length,
      'rate': rate,
      'voice': voice,
      'message': message
    };
  };

  return (
    <BrowserRouter basename='/toeic_exercise'>
        <Routes>
          <Route exact path="/">
            <Route index element={<MenuScreen />} />
            <Route path="Part2Menu" element={
              <Part2Menu
                setExams={setExams}
                player={player} />
              } />
              <Route path="Part2Direction" element={
                <Part2Direction
                  exams={exams}
                  setCurrentExamNumber={setCurrentExamNumber}
                  player={player} />
              } />
              <Route path="Part2Exercise" element={
                <Part2Exercise
                  exams={exams}
                  currentExamNumber={currentExamNumber}
                  setCurrentExamNumber={setCurrentExamNumber}
                  correctCount={correctCount}
                  setCorrectCount={setCorrectCount}
                  setResult={setResult}
                  getResult={get_result}
                  player={player} />
              } />
              <Route path="Result" element={
                <Result result={result} />
              } />
          </Route>
        </Routes>
    </BrowserRouter>
  );
};

const MenuScreen = () => {
  return (
    <div className="text-center">
      <Link to="/Part2Menu" className="btn btn-primary p-3 m-3 menu-btn">Part 2: Question & response</Link>
    </div>
  );
};

const Part2Menu = ({
  setExams,
  player
}) => {
  const [selectedOption, setSelectedOption] = useState('US');
  
  const playDirections = (size) => {
    var exams = getExams(size);
    setExams(exams);
    player.voice_type = selectedOption;
    player.play_directions('part2', exams.length);
  };

  const onSelectOption = (e) => {
    setSelectedOption(e.target.value);
  }

  return(
    <div>
      <div className="text-center">
        <h2 className="m-3">Part2: Question & Response</h2>
        <div>
          <Link to="/Part2Direction" className="btn btn-primary p-2 m-3 func-btn" onClick={() => {playDirections(10);}}>10 exams</Link>
          <Link to="/Part2Direction" className="btn btn-primary p-2 m-3 func-btn" onClick={() => {playDirections(25);}}>25 exams</Link>
        </div>
      </div>
      <div className="mx-4 p-4">
        <h4>Voice:</h4>
        <div className="form-check">
          <input className="form-check-input" type="radio" name="voice_type" id="voice_type_us" value="US" onChange={onSelectOption} checked={selectedOption === 'US'} />
          <label className="form-check-label" htmlFor="voice_type_us">United States</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="radio" name="voice_type" id="voice_type_in" value="IN" onChange={onSelectOption} checked={selectedOption === 'IN'} />
          <label className="form-check-label" htmlFor="voice_type_in">India</label>
        </div>
      </div>
    </div>
  );
};

const Part2Direction = ({
  exams,
  setCurrentExamNumber,
  player
}) => {
  const startExercise = () => {
    setCurrentExamNumber(1);
    player.play_exam(1, exams[0].Voices);
  };

  if (exams === undefined) {
    return (<Navigate to='/' />);
  }
  else {
    return(
      <div className="m-3">
        <h2 className="m-3">Part2: Question & Response</h2>
        <h3 className="m-3">Directions:</h3>
        <ul>
          <li>You will hear a question or statement and three responses spoken in English.</li>
          <li>They will not be displayed on your app screen and will be spoken only one time.</li>
          <li>Select the best response to the question or statement and click the button (A), (B) or (C) on your app screen.</li>
          <li>There are {exams.length} questions.</li>
          <li>When you are ready, click the "Start" button on the app screen to begin the exercise.</li>
        </ul>
        <div className="text-center">
          <Link to="/Part2Exercise" className="btn btn-primary p-2 m-3 func-btn" onClick={() => {startExercise();}}>Start</Link>
        </div>
      </div>
    );
  }
};

const Part2Exercise = ({
  exams,
  currentExamNumber,
  setCurrentExamNumber,
  correctCount,
  setCorrectCount,
  setResult,
  getResult,
  player
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  if (exams === undefined) {
    return (<Navigate to='/' />);
  }

  const nextExercise = () => {
    if (currentExamNumber >= exams.length) {
      const result = getResult();
      setResult(result);
      player.play_result(result.voice);
      return (<Navigate to='/Result' />);
    }
    else {
      setShowAnswer(false);
      const nextExamNumber = currentExamNumber + 1;
      setCurrentExamNumber(nextExamNumber);
      player.play_exam(nextExamNumber, exams[nextExamNumber - 1].Voices);
    }
  };
  
  const exam = exams[currentExamNumber - 1];
  const question_text = exam.Question;
  const answer_a_text = exam.AnswerA;
  const answer_b_text = exam.AnswerB;
  const answer_c_text = exam.AnswerC;
  const correct_answer = exam.CorrectAnswer;

  const enable_button = () => {
    return showAnswer? 'btn btn-secondary disabled' : 'btn btn-primary';
  };

  const show_answer = (value) => {
    let class_value;
    if (value === undefined) {
      class_value = "";
    }
    else if (value === correct_answer) {
      class_value = "correct-answer";
    }
    else {
      class_value = "incorrect-answer";
    }
    class_value += showAnswer? "" : " hidden";
    return class_value;
  }

  const show_correct_mark = (value) => {
    let class_value = 'bi';
    class_value += value === correct_answer? " bi-check2" : " bi-x-lg";
    class_value += showAnswer? "" : " hidden";
    return class_value;
  };

  const eval_answer = (value) => {
    setShowAnswer(true);
    if (value === correct_answer) {
      setCorrectCount(correctCount + 1);
      player.play_correct();
    }
    else {
      player.play_incorrect(correct_answer);
    }
  };
  
  return(
    <div className="m-3">
      <div className="p-1 m-1">
        <span className="fw-bold">Score: </span>
        <span>{correctCount}/{exams.length}</span>
      </div>
      <div className="fs-4 fw-bold p-1 m-1">
        <span>Part 2: </span>
        <span>No.{currentExamNumber}</span>
        <i className="bi bi-play-circle m-2" onClick={() => player.replay_exam()} />
      </div>
      <div className="p-1 m-1">
        <span className="fs-4 fw-bold">Question</span>
        <i className="bi bi-play-circle fs-4 m-2" onClick={() => player.replay_question()} />
        <div className={show_answer() + " p-2 question-text-area"}>{question_text}</div>
      </div>
      <div className="p-1 m-1">
        <div className="text-center">
          <button className={enable_button() + " menu-btn"} onClick={() => eval_answer('A')}>A</button>
          <i className="bi bi-play-circle playicon-for-button fs-4 m-2" onClick={() => player.replay_answer('A')} />
        </div>
        <div className={show_answer('A') + " d-flex flex-row p-2"}>
          <div><i className={show_correct_mark('A') + ' m-2'} /></div>
          <div className="answer-text-area">{answer_a_text}</div>
        </div>
      </div>
      <div className="p-1 m-1">
        <div className="text-center">
          <button className={enable_button() + " menu-btn"} onClick={() => eval_answer('B')}>B</button>
          <i className="bi bi-play-circle playicon-for-button fs-4 m-2" onClick={() => player.replay_answer('B')} />
        </div>
        <div className={show_answer('B') + " d-flex flex-row p-2"}>
          <div><i className={show_correct_mark('B') + ' m-2'} /></div>
          <div className="answer-text-area">{answer_b_text}</div>
        </div>
      </div>
      <div className="p-1 m-1">
        <div className="text-center">
          <button className={enable_button() + " menu-btn"} onClick={() => eval_answer('C')}>C</button>
          <i className="bi bi-play-circle playicon-for-button fs-4 m-2" onClick={() => player.replay_answer('C')} />
        </div>
        <div className={show_answer('C') + " d-flex flex-row p-2"}>
          <div><i className={show_correct_mark('C') + ' m-2'} /></div>
          <div className="answer-text-area">{answer_c_text}</div>
        </div>
      </div>
      <div className="m-2 text-center">
        <Link
          to={currentExamNumber >= exams.length? "/Result" : "/Part2Exercise"}
          className={show_answer() + " btn btn-primary p-2 m-3 func-btn"}
          onClick={() => {nextExercise()}}>
          {currentExamNumber >= exams.length? 'Show Result' : 'Next'}
        </Link>
      </div>
    </div>
  );
};

const Result = ({result}) => {
  if (result === undefined) {
    return (<Navigate to='/' />);
  }

  return (
    <div className="m-3 text-center">
      <h2>Part 2: Question & response</h2>
      <div className="p-1 m-1">
        <span className="fs-4 fw-bold">Score: </span>
        <span className="fs-4">{result.correctCount}/{result.examsCount}</span>
        <span className="fs-4">({result.rate * 100}%)</span>
      </div>
      <div className="fs-1 fw-bold p-1 m-1">{result.message}</div>
      <div className="text-center">
        <Link to="/" className="btn btn-primary p-2 m-3 func-btn">Back to Menu</Link>
      </div>
    </div>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<ToeicApp/>);