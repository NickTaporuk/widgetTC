define([
    'load!lib/classnames', 
    'load!components/header', 
    'load!components/content'
], function(
    cn, 
    Header, 
    Content
) {

    return {
        render: function() {
            return (
                <div id={cn('root')}>
                    <Header />
                    <Content />
                </div>
            );
        }
    };

});