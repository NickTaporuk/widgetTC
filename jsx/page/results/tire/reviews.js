define([
    'react',
    'classnames',
    'moment',
    'load!actions/actions',
    'load!stores/reviewsStore',
    'load!components/page/results/tire/stars'
], function (
    React,
    cn,
    moment,
    Act,
    reviewsStore,
    Stars
) {

    

    return {
        displayName: 'Reviews',

        getInitialState: function() {
            return {
                reviews: [],
                totalReviews: 0
            }
        },
 
        componentDidMount: function() {
            reviewsStore.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            reviewsStore.unbind('change', this._updateState);    
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return nextState.reviews.length !== this.state.reviews.length;
        },

        render: function() {
            if (this.state.totalReviews === 0) {
                return null;
            }

            var items = [];

            this.state.reviews.map(function(review, i) {
                items.push((
                    <div key={i} className={cn('result_review')}>
                        <h5 className={cn('result_review_title')}>{review.title}</h5>
                        <Stars rating={review.rating} />
                        <span className={cn('result_review_date')}>{moment(review.submitted_at).format('MMMM DD, YYYY')}</span>
                        <div className={cn('result_review_content')}>
                            <p dangerouslySetInnerHTML={{ __html: review.text }} />
                        </div>
                    </div>
                ));
            }.bind(this));

            if (this.state.reviews.length < this.state.totalReviews) {
                items.push(<a key="more" onClick={this._handleMoreClick} href="#more">Show more reviews</a>);
            }

            return (
                <div>
                    <h4 className={cn('result_reviews_heading')}><strong>{this.state.totalReviews}</strong> reviews:</h4>
                    {items}
                </div>
            );
        },

        _updateState: function() {
            this.setState({
                reviews: reviewsStore.getReviews(this.props.tireId),
                totalReviews: reviewsStore.getTotalReviews(this.props.tireId)
            });
        },

        _handleMoreClick: function(event) {
            event.preventDefault();
            Act.Tire.loadRewiews(this.props.tireId, this.state.reviews.length);
        }

    }


});