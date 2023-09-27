import React from "react";
import { Header } from "../components/Header";
import { BeginForm } from "../components/BeginForm";
import { Link } from "react-router-dom";
import { Rules } from "../components/Rules";
import { getUserLoggedIn } from "../redux/quizSlice";
import { useSelector } from "react-redux";
import musixmatchlogo from '../images/MusiXmatchLogo_NotGradient.png';
import musixmatchtitle from '../images/musixmatch_text.png';
import '../css/Home.css'

export const Home = () => 
{
    const { isUserLoggedIn } = useSelector(getUserLoggedIn);

    return (
        <div className="home">
            <Header />
            <BeginForm />
            {!!isUserLoggedIn ? (null) : (<Rules />)}
            <h3>Powered by</h3>
            <div className="logo_container">
                <Link to="https://www.musixmatch.com">
                    <img src={musixmatchlogo} alt="musixmatch_logo" />
                    <img src={musixmatchtitle} alt="musixmatch_title" />
                </Link>
            </div>
        </div>
    );
}