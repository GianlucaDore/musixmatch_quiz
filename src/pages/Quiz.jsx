import React, { useEffect } from "react";
import { Header } from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchArtists, getSpinnerStatus, turnOnSpinner } from "../redux/quizSlice";
import { QuizCard } from "../components/QuizCard";
import { ClipLoader } from "react-spinners";
import '../css/Quiz.css';

export const Quiz = () => 
{

    const dispatch = useDispatch();

    const isLoading = useSelector(getSpinnerStatus);

    useEffect(() => {

        dispatch(turnOnSpinner());

        dispatch(fetchArtists());

    }, [dispatch]);  // On component mount, we prepare the artists' database (the DB from which we pick the alternatives for each question).


    return (
        <div className="quiz">
            <Header />
            {!!isLoading ? (
                <div className="database_loading">
                    <h1>Preparing the database...</h1>
                    <ClipLoader color={'black'} loading={isLoading} size={150} /> 
                </div>
            ) : (
                <QuizCard />
             )}
        </div>
    )
}