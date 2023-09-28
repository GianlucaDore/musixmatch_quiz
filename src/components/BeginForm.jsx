import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserLoggedIn, setUser, newGame, logOutUser, getUserGameHistory } from "../redux/quizSlice";


export const BeginForm = () =>
{
    const [userName, setUserName] = useState("");  // Using state for our controlled form.

    const dispatch = useDispatch();

    const { username, isUserLoggedIn } = useSelector(getUserLoggedIn);  // Destructuring the object userLoggedIn in the store.

    const gameHistory = useSelector(getUserGameHistory);

    const navigate = useNavigate();

    return (
        <div className="beginform_container">
            {!!isUserLoggedIn ? (
                <div className="newgame_header">
                    {(gameHistory === null) ? (
                            <div>
                                <h1>Welcome to<br />'Who's Singing?',<br />{username}!</h1>
                                <h6>No past games available.</h6>
                            </div>
                        ) : (
                            <div>
                                <h1>Welcome back, {username}!</h1>
                                <h5>Game history for {username}:</h5>
                                <h6>(Oldest on top)</h6>
                                <ol>
                                    { gameHistory.map((s, index) => { return (<li key={index}>{s}</li>)
                                        })}
                                </ol>
                            </div>
                    )}
                    <button className="home_button" onClick={() => {dispatch(newGame()); navigate("/quiz?user=" + username)}}>Start game!</button>
                    <h1>or</h1>
                    <button className="home_button" onClick={() => {dispatch(logOutUser())}}>Log Out</button>
                </div>
            )  :  (  /* Relying on redux-persist for log-in redirection. */
                <div className="new_user">
                    <h1>Hello there!<br />Please insert your name here to log in:</h1>
                    <form onSubmit={(event) => {event.preventDefault(); dispatch(setUser(event.target[0].value)); navigate("/" )}}>
                        <input name="username_params" type="text" placeholder="Insert your name..." maxLength="10" value={userName} onChange={e => setUserName(e.target.value)} />
                        <button className="home_button" type="submit">Log In</button>
                    </form> 
                </div>

            )}
        </div>
    )
}