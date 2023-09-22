import React from "react";
import { Header } from "../components/Header";
import { BeginForm } from "../components/BeginForm";
import '../css/Home.css'
import musixmatchlogo from '../images/MusiXmatchLogo_NotGradient.png';
import musixmatchtitle from '../images/musixmatch_text.png';
import { Link } from "react-router-dom";

export const Home = () => 
{
    return (
        <div className="home">
            <Header />
            <BeginForm />
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