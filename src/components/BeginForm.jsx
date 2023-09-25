import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserLoggedIn, setUser, newGame, logOutUser } from "../redux/quizSlice";


export const BeginForm = () =>
{
    const [userName, setUserName] = useState("");  // Using state for our controlled form.

    const dispatch = useDispatch();

    const { username, isUserLoggedIn } = useSelector(getUserLoggedIn);  // Destructuring the object userLoggedIn in the store.

    const navigate = useNavigate();

    return (
        <div className="beginform_container">
            {!!isUserLoggedIn ? (
                <div className="newgame_header">
                    <h1>Welcome back, {username}!</h1>
                    <button className="start_button" onClick={() => {dispatch(newGame()); navigate("/quiz?user=" + username)}}>Start game!</button>
                    <h1 className="or_header">or</h1>
                    <button className="logout_button" onClick={() => {dispatch(logOutUser())}}>Log Out</button>
                </div>
            )  :  (
                <div className="new_user">
                    <h1 className="login_header">Hello there! Please insert your name here:</h1>
                    <form onSubmit={(event) => {event.preventDefault(); dispatch(setUser(event.target[0].value)); dispatch(newGame()); navigate("/quiz?user=" + event.target[0].value)}}>
                        <input name="username_params" type="text" placeholder="Insert your name..." value={userName} onChange={e => setUserName(e.target.value)} />
                        <button type="submit">Start the lyrics quiz!</button>
                    </form> 
                </div>

            )}
        </div>
    )
}