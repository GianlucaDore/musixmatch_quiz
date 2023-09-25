import React from "react";
import { Header } from "../components/Header";
import { getLeaderboards } from "../redux/quizSlice";
import { useSelector } from "react-redux";
import '../css/Leaderboards.css'
import gold from '../images/mxm_gold_icon.png';
import silver from '../images/mxm_silver_icon.png';
import bronze from '../images/mxm_bronze_icon.png';

export const Leaderboards = () => 
{
    const scoreboard = useSelector(getLeaderboards);

    const rankings = [gold, silver, bronze, "4.", "5.", "6.", "7.", "8.", "9.", "10."];

    return (
        <>
            <Header />
            <div className="container_leaderboards">
                <h1>Leaderboards</h1>
            </div>
            <div className="medals_scores_table">
                <div className="rankings">
                    <img className="medal" src={rankings[0]} alt="1st_place" />
                    <img className="medal" src={rankings[1]} alt="2nd_place" />
                    <img className="medal" src={rankings[2]} alt="3rd_place" />
                    { rankings.filter((item, index) => (index > 2)).map((r) => {return (
                        <p className="rank">{r}</p>
                    )})}
                </div>
                <table className="leaderboards"> 
                    <tbody>
                        {scoreboard.map((score, index) => { 
                            return (
                                <tr key={index} className="row">
                                    <td className="cell username">{score.username}</td>
                                    <td className="cell score">{score.score}</td>
                                </tr> )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}