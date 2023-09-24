import React, { useEffect } from "react";
import { Header } from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchArtists, getQuestion, getQuestionIndex, fetchQuestion, getClipLoaderStatus, turnOnSpinner, registerScore } from "../redux/quizSlice";
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


    /* First useEffect triggers on component's mount, to prepare the quiz alternative choices (artists to choose from) and
       dispatches the first question right after the artist database is fetched. */
    useEffect(() => {  

        dispatch(turnOnSpinner("page"));

        dispatch(fetchArtists())
            //.then(() => {dispatch(turnOnSpinner("card")); dispatch(fetchQuestion())});  // dispatching fetchQuestion (first Q) straight after artists retrieving.

    }, [dispatch]);  // On component mount, we prepare the artists' database (the DB from which we pick the alternatives for each question).


    useEffect(() => {

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

    }, [questionIndex]); // On questionIndex change, check if it exceeds 5 first; otherwise, fetch the question.

    return (
        <div className="quiz">
            <Header />
            {!!isLoading ? (
                <div className="database_loading">
                    <h1>Preparing the database...</h1>
                    <ClipLoader color={'black'} loading={isLoading} size={150} /> 
                </div>
            ) : (
                <QuizCard cardData={questionData} index={questionIndex} />
             )}
        </div>
    )
}