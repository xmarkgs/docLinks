import React, { Component } from 'react';
import './MasonryContainer.css';
import Masonry from 'react-masonry-css';
import DocCard from '../DocCard/DocCard';

class MasonryContainer extends Component {
    state = {
        popUpShown: false,
        prev: [],
    }

    popUpShown = () => {
        this.setState(({ popUpShown }) => ({
            popUpShown: !popUpShown
        }));
    }

    render() {
        let breakpointColumnsObj = {
            default: 4,
            1100: 3,
            760: 2,
            500: 1
        };

        if (this.props.docs.length > 0 && this.props.docs.length < 4) {
            breakpointColumnsObj = {
                default: this.props.docs.length
            }
        }

        return (
            <>
                {this.props.children}
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column">
                    {this.props.docs.map((doc) => (
                        <DocCard key={doc.id} doc={doc} eventsPopup={this.props.eventsPopup} popUpShown={this.popUpShown} popUp={this.state.popUpShown} />
                    ))}
                </Masonry>
            </>
        );
    }
}


export default MasonryContainer;