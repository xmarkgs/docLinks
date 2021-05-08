import React, { Component } from 'react';
import PopUp from './PopUp/PopUp';
import './DocCard.css';

class DocCard extends Component {
    state = {
        doc: this.props.doc,
        title: this.props.doc.title,
        show: false,
    }

    showPopUp = () => {
        if (this.props.popUp === false) {
            document.body.style.overflow = "hidden";
            this.setState(({ show }) => ({
                show: !show
            }));
            this.props.eventsPopup();
            this.props.popUpShown();
        }
    }

    hidePopUp = (e) => {
        console.log(e.target.className);
        if (e.target.className === "popup-container" || e.target.className === "popup__cross") {
            document.body.style.overflow = "auto";
            this.props.eventsPopup();
            this.props.popUpShown();
            this.setState(({ show }) => ({
                show: !show
            }));
        }
    }

    render() {
        let { title, doc, show } = this.state;

        return (
            <>
                <div
                    className="doc-card"
                    onClick={this.showPopUp}>
                    <h3 className="doc-card__title">{title}</h3>
                    <p className="doc-card__open-popup-link">
                        view stats
                    <img src="/right-arrow.svg" alt="" />
                    </p>
                </div>
                {show ? <PopUp doc={doc} hidePopUp={this.hidePopUp} /> : null}
            </>
        )
    }
}

export default DocCard;