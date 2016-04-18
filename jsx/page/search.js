/**
 * Selecting params for search tires and send selected params to search action after submit.
 */

define([
    'react',
    'classnames',
    'config',
    'load!actions/actions',
    'load!actions/act',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!components/elements/select'
], function(
    React,
    cn,
    config,
    Act,
    A,
    searchStore,
    locationsStore,
    SelectField
) {

    return {
        displayName: 'Search',

        getInitialState: function() {
            return  {
                activeTab: 'size',
                fieldOptions: {},
                fieldValues: {}
            }
        },

        componentWillMount: function() {
            this._updateState();
        },

        componentDidMount: function() {
            searchStore.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            searchStore.unbind('change', this._updateState);
        },
        
        render: function() {
            return (
                <div className={cn('search_wrapper')} id={cn('search_wrapper')}>
                    <div className={cn('search_inner')}>
                        <form id={cn('search_by')} className={cn('search_by')} role="search" onSubmit={this._handleSubmit}>
                            { this.props.canChangeLocation 
                                ? <a href="#locations" onClick={this._handleLocationsClick} className={cn(['change_location', 'modal_open'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0C8;' }} />Change Location</a>
                                : null
                            }
                            <div className={cn('tabs')}>
                                <ul role="tablist">
                                    {this._tabs()}                                    
                                </ul>
                                {this._tabsContent()}  
                            </div>
                        </form>
                    </div>          
                </div>                
            );
        },

        _tabs: function() {
            var tabs = [
                <li key={1} className={cn('tab')} role="presentation">
                    <a href="#vehicle_tab" onClick={this._handleTabClick.bind(this, 'vehicle')} className={cn(['tab_link', 'font_color'])} role="tab" aria-selected={this.state.activeTab == 'vehicle'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE531;' }} /> Search by vehicle</a>
                </li>,
                <li key={2} className={cn('tab')} role="presentation">
                    <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'size')} className={cn('font_color')} role="tab" aria-selected={this.state.activeTab == 'size'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE019;' }} /> Search by tire size</a>
                </li>
            ];
            if (config.sa) {
                tabs.push((
                    <li key={3} className={cn('tab')} role="presentation">
                        <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'part_number')} className={cn('font_color')} role="tab" aria-selected={this.state.activeTab == 'part_number'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8F3;' }} /> Search by part number</a>
                    </li>
                ));
            }
            return tabs;
        },

        _tabsContent: function() {
            var contents = [
                <div key={1} className={cn(['tab_cont', 'search_fields', 'by_vehicle_tab'])} id={cn('by_vehicle_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'vehicle'}>
                    <fieldset className={cn('fields_wrapper')}>
                        <div className={cn(['sixcol', 'fields_wrapper_1'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.year}                                                                     
                                        value={this.state.fieldValues.vehicle.year} onChange={this._handleVehicleChange} 
                                        name="vehicle_year" label="Choose Year"
                                        className={cn(['field'])} required={true} />
                            <SelectField 
                                        options={this.state.fieldOptions.make}          
                                        value={this.state.fieldValues.vehicle.make} onChange={this._handleVehicleChange}
                                        name="vehicle_make" label="Choose Make" required={true}
                                        className={cn(['field'])} disabled={this.state.fieldOptions.make.length <= 0} />
                            <SelectField 
                                        options={this.state.fieldOptions.model}         
                                        value={this.state.fieldValues.vehicle.model} onChange={this._handleVehicleChange}
                                        name="vehicle_model" label="Choose Model"
                                        className={cn(['field'])} disabled={this.state.fieldOptions.model.length <= 0} required="1" />
                        </div>
                        <div className={cn(['sixcol', 'last', 'fields_wrapper_2'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.trim}          
                                        value={this.state.fieldValues.vehicle.trim} onChange={this._handleVehicleChange}
                                        name="vehicle_trim" label="Choose Trim"
                                        className={cn(['field'])} disabled={this.state.fieldOptions.trim.length <= 0} required="1" />
                            <SelectField 
                                        options={this.state.fieldOptions.car_tire_id}   
                                        value={this.state.fieldValues.vehicle.car_tire_id} onChange={this._handleFieldChange}
                                        name="vehicle_car_tire_id" label="Tire Size"    
                                        className={cn(['field'])} disabled={this.state.fieldOptions.car_tire_id.length <= 0} required="1" emptyDesc={false}/>
                            <SelectField 
                                        options={this.state.fieldOptions.base_category}                                                            
                                        value={this.state.fieldValues.vehicle.base_category} onChange={this._handleFieldChange} 
                                        name="vehicle_base_category" label="Tire Category"
                                        className={cn(['field'])} emptyDesc="All Tires" />
                        </div>
                        
                        <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                    </fieldset>
                </div>,
                <div key={2} className={cn(['tab_cont', 'search_fields', 'by_tire_size_tab'])} id={cn('by_tire_size_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'size'}>
                    <fieldset className={cn('fields_wrapper')}>
                        <div className={cn(['sixcol', 'fields_wrapper_1'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.width}         
                                        value={this.state.fieldValues.size.width} onChange={this._handleFieldChange}          
                                        name="size_width" label="Choose Width"  
                                        className={cn(['field'])} required="1" />
                            <SelectField 
                                        options={this.state.fieldOptions.height}        
                                        value={this.state.fieldValues.size.height} onChange={this._handleFieldChange}  
                                        name="size_height" label="Choose Height" required="1" 
                                        className={cn(['last', 'field'])} />
                            <SelectField 
                                        options={this.state.fieldOptions.rim}           
                                        value={this.state.fieldValues.size.rim} onChange={this._handleFieldChange} 
                                        name="size_rim" label="Choose Rim"    
                                        className={cn(['field'])} required="1" />
                        </div>
                        <div className={cn(['sixcol', 'last', 'fields_wrapper_2'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.speed_rating} 
                                        value={this.state.fieldValues.size.speed_rating} onChange={this._handleFieldChange} 
                                        name="size_speed_rating" label="Speed Rating" 
                                        className={cn(['field'])}  />
                            <SelectField 
                                        options={this.state.fieldOptions.load_index} 
                                        value={this.state.fieldValues.size.load_index} onChange={this._handleFieldChange} 
                                        name="size_load_index" label="Load Index" 
                                        className={cn(['last', 'field'])} />
                            <SelectField 
                                        options={this.state.fieldOptions.base_category} 
                                        value={this.state.fieldValues.size.base_category} onChange={this._handleFieldChange} 
                                        name="size_base_category" label="Tire Category"
                                        className={cn(['last', 'field'])} emptyDesc="All Tires" />
                        </div>

                        <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                    </fieldset>
                </div>
            ];
            if (config.sa) {
                contents.push((
                    <div key={3} className={cn(['tab_cont', 'search_fields', 'by_part_number_tab'])} id={cn('by_part_number_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'part_number'}>
                        <fieldset className={cn('fields_wrapper')}>
                            <div className={cn(['sixcol'])}>
                                <label htmlFor={cn('part_number')}>
                                    <span>Enter part number </span><span className="req">*</span>
                                </label>
                                <input onChange={this._handleFieldChange} type="text" id={cn('part_number')} name="part_number" value={this.state.fieldValues.part_number.part_number} />
                            </div>
                            <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                        </fieldset>
                    </div>
                ));
            }

            return contents;
        },

        _isReadyForSearch: function() {
            var isReady = false;
            var values = this.state.fieldValues[this.state.activeTab];
            switch (this.state.activeTab) {
                case 'size':
                    isReady = (values.width && values.height && values.rim);
                    break;
                case 'vehicle':
                    isReady = (values.car_tire_id != false);
                    break;
                case 'part_number':
                    isReady = (values.part_number != false);
                    break;
            }
            return isReady;
        },

        _updateState: function() {
            this.setState({
                activeTab: searchStore.getActiveSection(),
                fieldOptions: searchStore.getAllOptions(),
                fieldValues: searchStore.getAllValues()
            });
        },

        _handleTabClick: function(tab, event) {
            event.preventDefault();
            Act.Search.changeTab(tab);
        },

        _handleSubmit: function(event) {
            if (event) {
                event.preventDefault();
            }
            if (this._isReadyForSearch()) {
                var params = this.state.fieldValues[this.state.activeTab];
                var curLocation = locationsStore.getCurrentLocation();

                if ( curLocation ) {
                    params.location_id = curLocation.id;
                    A.resultsPage.update(params);
                } else {
                    this._handleLocationsClick();    
                }
            }
        },

        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace( (this.state.activeTab + '_'), '');
            Act.Search.updateField(this.state.activeTab, fieldName, event.target.value);
        },

        _handleVehicleChange: function(event) {
            var fields = ['year', 'make', 'model', 'trim'];
            var fieldName = event.target.name.replace( (this.state.activeTab + '_'), '');
            var index = fields.indexOf(fieldName);

            var values = this.state.fieldValues.vehicle;
            values[fieldName] = event.target.value;
            
            var values = {
                year: values.year,
                make: index < 1 ? '' : values.make,
                model: index < 2 ? '' : values.model,
                trim: index < 3 ? '' : values.trim
            };

            Act.Vehicle.change(values, 'search');
        },

        _handleLocationsClick: function(event) {
            if (event) {
                event.preventDefault();
            }
            var self = this;
            Act.Popup.show('locations', {
                onLocationSelect: function() {
                    self._handleSubmit();
                }
            });
        }
    }

});