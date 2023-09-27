import React from "react";
import { useNavigate } from "react-router-dom";

export const Rules = () =>
{
    const navigate = useNavigate();

    return (
        <div className="rules">
            <h1>Rules</h1>
            <p>The game is simple: for each lyrics displayed, identify the artist that sings the lyrics' corresponding track.<br />
                You'll get 100 base points plus an increment based on how quickly you answered in case you got it right.<br />
                You'll lose 50 points in case you're mistaken.<br />
                If the timer runs out, the question is unanswered and your score stays the same.<br />
                You can directly go to the leaderboards by going to the URL '/leaderboards', or by clicking the button below:
            </p>
            <button className="home_button" onClick={() => navigate("/leaderboards")}>Go to Leaderboards</button>
        </div>
    );
}