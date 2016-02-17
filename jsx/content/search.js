define([
    'react',
    'classnames',
    'load!actions/actions'
], function(
    React,
    cn,
    Act
) {

    return {
        getInitialState: function() {
            return  {
                tabs: {
                    vehicle: false,
                    size: true
                }
            }
        },

        render: function() {

            return (
                <div className={cn('search_wrapper')} id={cn('search_wrapper')}>
                    <div className={cn('search_inner')}>
                        <p className={cn('search_intro')}>Find your tires using the form below. You can search by vehicle or tire size. You can also narrow down your search by tire category and brand.</p>
                        <form action="results.php" id={cn('search_by')} className={cn('search_by')} role="search">
                            <a href="#locations" className={cn(['change_location', 'modal_open'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0C8;' }} />Change Location</a>
                            <div className={cn('tabs')}>
                                <ul role="tablist">
                                    <li className={cn('tab')} role="presentation">
                                        <a href="#vehicle_tab" onClick={this._handleTabClick.bind(this, 'vehicle')} className={cn(['tab_link', 'font_color'])} role="tab" aria-selected={this.state.tabs.vehicle}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE531;' }} /> Search by vehicle</a>
                                    </li>
                                    <li className={cn('tab')} role="presentation">
                                        <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'size')} className={cn('font_color')} role="tab" aria-selected={this.state.tabs.size}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE019;' }} /> Search by tire size</a>
                                    </li>
                                </ul>
                                <div className={cn(['tab_cont', 'search_fields', 'by_vehicle_tab'])} id={cn('by_vehicle_tab')} role="tabpanel" tabIndex="0" aria-hidden={!this.state.tabs.vehicle}>
                                    <fieldset className={cn('fields_wrapper')}>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <label htmlFor={cn('vehicle_year')}>Choose Year <span className="req">*</span></label>
                                            <select id={cn('vehicle_year')} name="year">
                                                <option value="">- Select -</option>
                                                <option value="2016">2016</option>
                                            </select>
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <label htmlFor={cn('vehicle_make')}>Choose Make <span className="req">*</span></label>
                                            <select id={cn('vehicle_make')} name="make"><option value="">- Select -</option><option value="Acura">Acura</option><option value="Aston Martin">Aston Martin</option><option value="Audi">Audi</option><option value="Bentley">Bentley</option><option value="BMW">BMW</option><option value="Buick">Buick</option><option value="Cadillac">Cadillac</option><option value="Chevrolet">Chevrolet</option><option value="Chrysler">Chrysler</option><option value="Dodge">Dodge</option><option value="Ferrari">Ferrari</option><option value="Fiat">Fiat</option><option value="Ford">Ford</option><option value="Freightliner">Freightliner</option><option value="GMC">GMC</option><option value="Honda">Honda</option><option value="Hyundai">Hyundai</option><option value="Infiniti">Infiniti</option><option value="Jaguar">Jaguar</option><option value="Jeep">Jeep</option><option value="Kia">Kia</option><option value="Lamborghini">Lamborghini</option><option value="Land Rover">Land Rover</option><option value="Lexus">Lexus</option><option value="Lincoln">Lincoln</option><option value="Maserati">Maserati</option><option value="Mazda">Mazda</option><option value="McLaren">McLaren</option><option value="Mercedes-Benz">Mercedes-Benz</option><option value="Mini">Mini</option><option value="Mitsubishi">Mitsubishi</option><option value="Nissan">Nissan</option><option value="Porsche">Porsche</option><option value="RAM">RAM</option><option value="Rolls-Royce">Rolls-Royce</option><option value="Scion">Scion</option><option value="Smart">Smart</option><option value="Subaru">Subaru</option><option value="Tesla">Tesla</option><option value="Toyota">Toyota</option><option value="Volkswagen">Volkswagen</option><option value="Volvo">Volvo</option></select>
                                        </div>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <label htmlFor={cn('vehicle_model')}>Choose Model <span className="req">*</span></label>
                                            <select id={cn('vehicle_model')} name="model"><option value="">- Select -</option><option value="Camaro">Camaro</option><option value="Caprice">Caprice</option><option value="Captiva Sport">Captiva Sport</option><option value="City Express">City Express</option><option value="Colorado">Colorado</option><option value="Corvette">Corvette</option><option value="Cruze">Cruze</option><option value="Equinox">Equinox</option><option value="Express 2500">Express 2500</option><option value="Express 3500">Express 3500</option><option value="Impala">Impala</option><option value="Impala Limited">Impala Limited</option><option value="Malibu">Malibu</option><option value="Silverado 1500 High Country">Silverado 1500 High Country</option><option value="Silverado 1500 LS">Silverado 1500 LS</option><option value="Silverado 1500 LT">Silverado 1500 LT</option><option value="Silverado 1500 LTZ">Silverado 1500 LTZ</option><option value="Silverado 1500 WT">Silverado 1500 WT</option><option value="Silverado 2500 HD High Country">Silverado 2500 HD High Country</option><option value="Silverado 2500 HD LT">Silverado 2500 HD LT</option><option value="Silverado 2500 HD LTZ">Silverado 2500 HD LTZ</option><option value="Silverado 2500 HD WT">Silverado 2500 HD WT</option><option value="Silverado 3500 HD High Country">Silverado 3500 HD High Country</option><option value="Silverado 3500 HD LT">Silverado 3500 HD LT</option><option value="Silverado 3500 HD LTZ">Silverado 3500 HD LTZ</option><option value="Silverado 3500 HD WT">Silverado 3500 HD WT</option><option value="Sonic">Sonic</option><option value="Spark">Spark</option><option value="Spark EV">Spark EV</option><option value="SS">SS</option><option value="Suburban">Suburban</option><option value="Tahoe">Tahoe</option><option value="Traverse">Traverse</option><option value="Trax">Trax</option><option value="Volt">Volt</option></select>
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <label htmlFor={cn('vehicle_trim')}>Choose Trim <span className="req">*</span></label>
                                            <select id={cn('vehicle_trim')} name="trim"><option value="">- Select -</option><option value="LS">LS</option><option value="LT">LT</option><option value="LT w/RS Pkg.">LT w/RS Pkg.</option><option value="SS">SS</option><option value="SS w/Performance Pkg.">SS w/Performance Pkg.</option><option value="Z/28">Z/28</option><option value="ZL1">ZL1</option></select>
                                        </div>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <label htmlFor={cn('category_param')}>Tire Type</label>
                                            <select id={cn('category_param')} name="cat">
                                                <option value="">All Tires</option>
                                                <option value="9">Winter Tires</option>
                                                <option value="13">All Season Tires</option>
                                                <option value="15">Performance Tires</option>
                                            </select>
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <label htmlFor={cn('vehicle_size')}>Tire Size</label>
                                            <select id={cn('vehicle_size')} name="size">
                                                <option value="cartireid=127285">P245/55R18 102T Alternate OE</option>
                                                <option value="cartireid=127286">P245/50ZR19 104W XL Alternate OE</option>
                                            </select>
                                        </div>
                                        <button type="submit" className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')}></i> Find Your Tires</button>
                                    </fieldset>
                                </div>
                                <div className={cn(['tab_cont', 'search_fields', 'by_tire_size_tab'])} id={cn('by_tire_size_tab')} role="tabpanel" tabIndex="0" aria-hidden={!this.state.tabs.size}>
                                    <fieldset className={cn('fields_wrapper')}>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <label htmlFor={cn('tire_width')}>Choose Width <span className="req">*</span></label>
                                            <select id={cn('tire_width')} name="width"><option value="">- Select -</option><option value="135">135</option><option value="145">145</option><option value="155">155</option><option value="165">165</option><option value="175">175</option><option value="185">185</option><option value="195">195</option><option value="205">205</option><option value="215">215</option><option value="225">225</option><option value="235">235</option><option value="245">245</option><option value="255">255</option><option value="265">265</option><option value="275">275</option><option value="285">285</option><option value="295">295</option><option value="305">305</option><option value="315">315</option><option value="325">325</option><option value="335">335</option><option value="345">345</option><option value="355">355</option><option value="365">365</option><option value="375">375</option><option value="385">385</option><option value="395">395</option><option value="405">405</option><option value="425">425</option><option value="445">445</option><option value="455">455</option><option value="7">7</option><option value="7.5">7.5</option><option value="8">8</option><option value="8.25">8.25</option><option value="8.75">8.75</option><option value="9">9</option><option value="9.5">9.5</option><option value="9.59">9.59</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="27">27</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="42">42</option></select>
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <label htmlFor={cn('tire_height')}>Choose Height <span className="req">*</span></label>
                                            <select id={cn('tire_height')} name="height"><option value="">- Select -</option><option value="NONE">NONE</option><option value="25">25</option><option value="30">30</option><option value="35">35</option><option value="20">20</option><option value="40">40</option><option value="45">45</option><option value="50">50</option><option value="55">55</option><option value="60">60</option><option value="65">65</option><option value="70">70</option><option value="75">75</option><option value="80">80</option><option value="85">85</option><option value="680">680</option><option value="700">700</option><option value="710">710</option><option value="790">790</option><option value="8.5">8.5</option><option value="9.5">9.5</option><option value="10.5">10.5</option><option value="11.5">11.5</option><option value="12.5">12.5</option><option value="13.5">13.5</option><option value="14.5">14.5</option><option value="15.5">15.5</option></select>
                                        </div>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <label htmlFor={cn('tire_rim')}>Choose Rim <span className="req">*</span></label>
                                            <select id={cn('tire_rim')} name="rim"><option value="">- Select -</option><option value="10">10"</option><option value="12">12"</option><option value="13">13"</option><option value="14">14"</option><option value="15">15"</option><option value="16">16"</option><option value="16.5">16.5"</option><option value="17">17"</option><option value="17.5">17.5"</option><option value="18">18"</option><option value="19">19"</option><option value="19.5">19.5"</option><option value="20">20"</option><option value="21">21"</option><option value="22">22"</option><option value="22.5">22.5"</option><option value="23">23"</option><option value="24">24"</option><option value="24.5">24.5"</option><option value="25">25"</option><option value="26">26"</option><option value="28">28"</option><option value="30">30"</option><option value="460">460"</option><option value="480">480"</option><option value="540">540"</option></select>
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <label htmlFor={cn('tire_category')}>Tire Type</label>
                                            <select id={cn('tire_category')} name="base_category">
                                                <option value="">All Tires</option>
                                                <option value="9">Winter Tires</option>
                                                <option value="13">All Season Tires</option>
                                                <option value="15">Performance Tires</option>
                                            </select>
                                        </div>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <label htmlFor={cn('tire_rating')}>Speed Rating</label>
                                            <select id={cn('tire_rating')} name="speed_rating"><option value="">All</option><option value="A1">A1 5km / 3mi</option><option value="A2">A2 10km / 6mi</option><option value="A3">A3 15km / 9mi</option><option value="A4">A4 20km / 12mi</option><option value="A5">A5 25km / 16mi</option><option value="A6">A6 30km / 19mi</option><option value="A7">A7 35km / 22mi</option><option value="A8">A8 40km / 25mi</option><option value="B">B 50km / 31mi</option><option value="C">C 60km / 37mi</option><option value="D">D 65km / 40mi</option><option value="E">E 70km / 43mi</option><option value="F">F 80km / 50mi</option><option value="G">G 90km / 56mi</option><option value="J">J 100km / 62mi</option><option value="K">K 110km / 68mi</option><option value="L">L 120km / 75mi</option><option value="M">M 130km / 81mi</option><option value="N">N 140km / 87mi</option><option value="P">P 150km / 94mi</option><option value="Q">Q 160km / 100mi</option><option value="R">R 170km / 106mi</option><option value="S">S 180km / 112mi</option><option value="T">T 190km / 118mi</option><option value="U">U 200km / 124mi</option><option value="H">H 210km / 130mi</option><option value="V">V 240km / 149mi</option><option value="Z">Z over 240km / over 149mi</option><option value="W">W 270km / 168mi</option><option value="(W)">(W) over 270km / over 168mi</option><option value="Y">Y 300km / 186mi</option><option value="(Y)">(Y) over 300km / over 186mi</option></select>
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <label htmlFor={cn('tire_index')}>Load Index</label>
                                            <select id={cn('tire_index')} name="load_index"><option value="">All</option><option value="63">63</option><option value="64">64</option><option value="65">65</option><option value="66">66</option><option value="67">67</option><option value="68">68</option><option value="69">69</option><option value="70">70</option><option value="71">71</option><option value="72">72</option><option value="73">73</option><option value="74">74</option><option value="75">75</option><option value="76">76</option><option value="77">77</option><option value="78">78</option><option value="79">79</option><option value="80">80</option><option value="81">81</option><option value="82">82</option><option value="83">83</option><option value="84">84</option><option value="85">85</option><option value="86">86</option><option value="87">87</option><option value="88">88</option><option value="89">89</option><option value="90">90</option><option value="91">91</option><option value="92">92</option><option value="93">93</option><option value="94">94</option><option value="95">95</option><option value="96">96</option><option value="97">97</option><option value="98">98</option><option value="99">99</option><option value="100">100</option><option value="101">101</option><option value="102">102</option><option value="103">103</option><option value="104">104</option><option value="105">105</option><option value="106">106</option><option value="107">107</option><option value="108">108</option><option value="109">109</option><option value="110">110</option><option value="111">111</option><option value="112">112</option><option value="113">113</option><option value="114">114</option><option value="115">115</option><option value="116">116</option><option value="117">117</option><option value="118">118</option><option value="119">119</option><option value="120">120</option><option value="121">121</option><option value="122">122</option><option value="123">123</option><option value="124">124</option><option value="125">125</option><option value="126">126</option><option value="127">127</option><option value="128">128</option><option value="129">129</option><option value="130">130</option></select>
                                        </div>
                                        <button type="submit" className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                                    </fieldset>
                                </div>
                            </div>
                        </form>
                    </div>          
                </div>                
            );
        },

        _handleTabClick: function(tab, event) {
            event.preventDefault();

            Act.Search.updateParam('tab', tab);

            this.setState({'tabs': {
                vehicle: tab === 'vehicle',
                size: tab === 'size'
            }});
        }
    }

});