import React from "react";
import { Header } from "../components/Header";
import { getLeaderboards } from "../redux/quizSlice";
import { useSelector } from "react-redux";

export const Leaderboards = () => 
{
    const scoreboard = useSelector(getLeaderboards);

    return (
        <div className="leaderboards">
            <Header />
            {scoreboard.map((score) => { return (
                <div>
                  <h5>{score.score}</h5>
                  <p>{score.username}</p>
                </div> )
            })}

        </div>
    )
}