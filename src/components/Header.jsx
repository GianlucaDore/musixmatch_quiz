import React from "react";
import { useSelector } from "react-redux";
import { getUserLoggedIn } from "../redux/quizSlice";
import userimage from '../images/user.png';

export const Header = () =>
{
    const { username } = useSelector(getUserLoggedIn);

    return (
        <div className="header_page">
            <h1>Who's Singing?</h1>
            {!!username ? (  /* We render the username and the icon only if there's actually a user logged in. */
                <div className="current_user">
                    <img src={userimage} alt="user_icon" />
                    <p>{username}</p>
                </div>
            ) : (null) }
        </div>
    )
}