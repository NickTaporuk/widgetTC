define([
    'react',
    'reactDOM',
    'classnames',
    'lib/helper',
    'moment',
    'isMobile',
    'load!actions/actions',
    'load!stores/reviewsStore',
    'load!components/page/results/tire/stars'
], function (
    React,
    ReactDOM,
    cn,
    h,
    moment,
    isMobile,
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
 
        componentWillMount: function() {
            this._updateStateBaseOnProps(this.props);
            this._updateState();
        },

        componentDidMount: function() {
            reviewsStore.bind('change', this._updateState);
            this._load(this.props.load);
        },

        componentWillUnmount: function() {
            reviewsStore.unbind('change', this._updateState);    
        },

        componentWillReceiveProps: function(nextProps) {
            this._updateStateBaseOnProps(nextProps);
            this._load(nextProps.load);
        },

        componentDidUpdate: function() {
            if (isMobile.any && this.state.scrollToTop && this.state.totalReviews) {
                // scroll to top of the component
                h.scrollToTop( ReactDOM.findDOMNode(this).parentNode , true );
                this.setState({
                    scrollToTop: false
                });
            }
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return nextState.reviews.length !== this.state.reviews.length || nextState.scrollToTop;
        },

        render: function() {
            if (!this.state.totalReviews) {
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

        _load: function(need) {
            if (need && !this.state.totalReviews) {
                Act.Tire.loadRewiews(this.props.tireId);
            }
        },

        _updateStateBaseOnProps: function(props) {
            this.setState({
                scrollToTop: props.scrollToTop
            });


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