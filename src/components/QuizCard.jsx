import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPoints, fetchQuestion, getClockLoaderStatus, noPoints, subtractPoints, turnOnSpinner } from "../redux/quizSlice";
import { ClockLoader } from "react-spinners";

export const QuizCard = (props) =>
{
    const [clock, setClock] = useState(60); // We make use of local component state to set a timer for each answer.

    const { options, correctAnswer, lyrics_line } = props.cardData;

    const dispatch = useDispatch();

    const isLoading = useSelector(getClockLoaderStatus);


    /* Let's implement the logic for the timer. */
    useEffect(() => {

        let intervalID;

        if (clock > 0)  // If the timer is not yet expired...
        {
            /* ... Function updates the clock in intervals of 1 second each, until it reaches 0. */
            intervalID = setInterval(() => {
                setClock((prevState) => (prevState-1));  // After each interval expires, we fire the setState to update the clock to (clockValue - 1) seconds.
            }, 1000); // The setState gets called when each interval ends. Each interval is 1000 ms == 1 s.

        }

        if (clock === 0)
        {
            dispatch(noPoints());
            dispatch(fetchQuestion());
            setClock(60);
        }

        // Cleanup function to clear the subscription to the timer. 
        return () => clearInterval(intervalID); 

    }, [clock, dispatch]);  // This code must be checked each time the state updates.


    const checkChoice = (choice) => 
    {
        if (choice.artist_id === correctAnswer.artist_id)
            dispatch(addPoints());
        if (choice.artist_id !== correctAnswer.artist_id)
            dispatch(subtractPoints());

        setClock(60);
        return;
    };


    return (
        <>
            {!!isLoading ? (
                <div className="quizcard">
                    <h1>Question {props.questionIndex}.</h1>
                    <ClockLoader color={'black'} loading={isLoading} size={100} />
                </div>
            ) : (
                <div className="quizcard">
                    <h1>Question {props.index}.</h1>
                    <h1>Time: {clock}</h1>
                    <div className="lyrics_body">
                        <h6>Who sings these lyrics?</h6>
                        <p>{lyrics_line}</p>
                    </div>
                    <div className="choices">
                        <div className="alternative">
                            <button className="alternative_button" onClick={() => {checkChoice(options[0]); dispatch(turnOnSpinner("card"));}}>
                                <h1>A.</h1>
                                <h1>{options[0].artist_name}</h1>
                            </button>
                        </div>
                        <div className="alternative">
                            <button className="alternative_button" onClick={() => {checkChoice(options[1]); dispatch(turnOnSpinner("card"));}}>
                                <h1>B.</h1>
                                <h1>{options[1].artist_name}</h1>
                            </button>
                        </div>
                        <div className="alternative">
                            <button className="alternative_button" onClick={() => {checkChoice(options[2]); dispatch(turnOnSpinner("card"));}}>
                                <h1>C.</h1>
                                <h1>{options[2].artist_name}</h1>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
        
    )
};