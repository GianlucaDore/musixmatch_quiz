import React, { useEffect } from "react";
import { Header } from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchDatabase, getQuestion, getQuestionIndex, fetchQuestion, getClipLoaderStatus, turnOnSpinner, registerScore, getUserLoggedIn } from "../redux/quizSlice";
import { QuizCard } from "../components/QuizCard";
import { ClipLoader } from "react-spinners";
import '../css/Quiz.css';
import { useNavigate } from "react-router-dom";

export const Quiz = () => 
{
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const isLoading = useSelector(getClipLoaderStatus);

    /* Parent component subscribes to question in the redux state. As the store updates the question, component re-renders
       and child's props change, re-rendering QuizCard with a new question. */
    const questionData = useSelector(getQuestion);

    const questionIndex = useSelector(getQuestionIndex);

    const { isUserLoggedIn } = useSelector(getUserLoggedIn);


    /* First useEffect triggers on component's mount, to prepare the quiz alternative choices (artists to choose from) and
       dispatches the first question right after the artist database is fetched. */
    useEffect(() => { 
        
        if (isUserLoggedIn === false)  // If the user tries to access the URL of the quiz (knowing the route/URL) without being logged in.
        {
            alert("You must be logged in in order to access the quiz!");
            navigate("/");
        }

        dispatch(turnOnSpinner("page"));

        dispatch(fetchDatabase());
            
    }, [isUserLoggedIn, dispatch, navigate]);  // On component mount, we prepare the artists' database (the DB from which we pick the alternatives for each question).


    useEffect(() => {

        /* Race condition: in the quiz section, isLoading indicates only if the database is loading or not. */
        if (isLoading === false)   // If the database is not loading data, we can start with the questions.
        {
            if (questionIndex > 5) 
            {
                dispatch(registerScore()); // goToLeaderboards when questionIndex is greater than 5
                navigate("/leaderboards");
            }

            else
            {
                dispatch(turnOnSpinner("card"));
                dispatch(fetchQuestion());  // The next question builder is always triggered by this wrapper component.
            }
        }

    }, [questionIndex, isLoading, dispatch, navigate]); // On questionIndex change, check if it exceeds 5 first; otherwise, fetch the question.

    return (
        <div className="quiz">
            <Header />
            {!!isLoading ? (
                <div className="database_loading">
                    <h1>Preparing the database...</h1>
                    <ClipLoader color={'black'} loading={isLoading} size={150} /> 
                </div>
            ) : (
                <div className="quizcard">
                    <QuizCard cardData={questionData} index={questionIndex} />
                </div>)}
        </div>
    )
}