define([
    'react',
    'load!stores/locationsStore',
    'load!actions/actions',
    'classnames'
], function(
    React,
    locationsStore,
    Act,
    cn
) {

    return {
        render: function() {
            var locationEls = [];

            var locations = locationsStore.getLocations();

            Object.keys(locations).forEach(function(locationId, i) {
                var location = locations[locationId];
                locationEls.push((
                    <li key={i}>
                        <h5>{location.name}</h5>
                        <div className={cn('location_address')}>{location.address_line_1 + ' ' + location.address_line_2}</div>
                        <div><span className={cn('location_city')}>{location.city}</span>, <span className={cn('location_region')}>{location.province}</span>, <span className={cn('location_postal')}>{location.postal_code}</span></div>
                        <a href={ 'http://maps.google.com/?q=' + location.latitude + ',' + location.longitude + '&z=13' } target="_blank">Directions</a>
                        <button onClick={this._handleSelectClick.bind(this, location.id)} className={cn(['brand_btn', 'btn_small', 'location_btn'])}>Select this location</button>
                    </li>
                ));
            }, this);

            return (
                <div>
                    <ul id={cn('locations')} className={cn('locations')}>
                        {locationEls}
                    </ul>
                </div>
            )
        },

        _handleSelectClick: function(id, event) {
            event.preventDefault();
            Act.Locations.select(id);
        }
    }

});