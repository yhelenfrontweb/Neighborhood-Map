var locations = [ //Location Data
    {
        name: 'St Bavos Cathedral',
        lat: 51.052981,
        lng: 3.727520,
        url: 'http://www.sintbaafskathedraal.be/'
    }, {
        name: 'Gravensteen',
        lat: 51.057556,
        lng: 3.720930,
        url: 'https://gravensteen.stad.gent/'
    }, {
        name: 'Design Museum Ghent',
        lat: 51.055796,
        lng: 3.719837,
        url: 'http://www.designmuseumgent.be/'
    }, {
        name: 'Museum of Fine Arts Ghent',
        lat: 51.038089,
        lng: 3.724218,
        url: 'http://www.mskgent.be/en'
    }, {
        name: 'Kuipke',
        lat: 51.039437,
        lng: 3.729287,
        url: 'https://stad.gent/openingsuren-adressen/kuipke'
    }, {
        name: 'The Leie River',
        lat: 51.054371,
        lng: 3.720437,
        url: 'http://www.european-waterways.eu/e/info/belgium/Leie.php'
    }, {
        name: 'Great Butchers Hall',
        lat: 51.055681,
        lng: 3.722104,
        url: 'http://www.grootvleeshuis.be/en/'
    }, {
        name: 'Belfry of Ghent',
        lat: 51.053648,
        lng: 3.724956,
        url: 'http://www.belfortgent.be/'
    }, {
        name: 'Boekentoren',
        lat: 51.045241,
        lng: 3.725216,
        url: 'http://www.boekentoren.be/'
    }, {
        name: 'Vooruit Centre',
        lat: 51.047752,
        lng: 3.727829,
        url: 'http://vooruit.be/en/'
    }
];
//ViewModel Begin
function viewModel() {
        var self = this;
        var Location = function(data) {
            this.name = data.name;
            this.url = data.url;
            this.latlng = data.latlng;
        };
        self.locationsList = ko.observableArray(locations);
        //Setting initial infowindow 
        var infowindow = new google.maps.InfoWindow({
            info: '',
        });
        var marker;
        self.locationsList().forEach(function(place) {
            marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(place.lat,
                    place.lng),
                title: place.name,
                animation: google.maps.Animation.DROP,
                icon: 'img/mapicon.png',
            });
            place.marker = marker;
            place.marker.addListener('click', toggleBounce);

            function toggleBounce() {
                if (place.marker.getAnimation() !== null) {
                    place.marker.setAnimation(null);
                } else {
                    place.marker.setAnimation(google.maps.Animation
                        .BOUNCE);
                    setTimeout(function() {
                        place.marker.setAnimation(null);
                    }, 1000);
                }
            }
            google.maps.event.addListener(place.marker, 'click',
                function() {
                    if (!infowindow) {
                        infowindow = new google.maps.InfoWindow();
                    }
                    //Setting wikipedia API
                    var contentInfo;
                    var infoNames = place.name;
                    var infoURL = place.url;
                    var urlNames = encodeURI(place.name);
                    var wikiUrl =
                        "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
                        urlNames +
                        "&limit=1&redirects=return&format=json";
                    self.wikiTimeout = setTimeout(function() {
                        alert(
                            'ERROR: Data could not be retrieved, Please Try Again Later'
                        );
                    }, 5000);
                    $.ajax({
                        url: wikiUrl,
                        dataType: "jsonp",
                        jsonpCallback: "foo", // for caching
                        cache: true
                    }).done(function(data) {
                        clearTimeout(self.wikiTimeout);
                        var infoList = data[1];
                        if (infoList.length > 0) {
                            for (var i = 0; i < infoList.length; i++) {
                                contentInfo = '<div>' +
                                    '<h4 class="title">' +
                                    infoNames + '</h4>' +
                                    '<p>' + data[2] +
                                    '</p>' + '<a href="' +
                                    infoURL +
                                    '" target="_blank">' +
                                    infoURL + '</a>' +
                                    '</div>';
                                infowindow.setContent(
                                    contentInfo);
                            }
                        } else {
                            contentInfo = '<div>' +
                                '<h4 class="title">' +
                                infoNames + '</h4>' + '<p>' +
                                "Sorry, No Articles Found on Wikipedia. Please click the link below. " +
                                '</p>' + '<a href="' +
                                infoURL +
                                '" target="_blank">' +
                                infoURL + '</a>' + '</div>';
                            infowindow.setContent(
                                contentInfo);
                        }
                        infowindow.open(map, place.marker);
                    }).fail(function(XHR, status, error) {
                        console.log(error);
                        contentInfo = '<div>' +
                            '<h4 class="title">' +
                            infoNames + '</h4>' + '<p>' +
                            "Failed to reach Wikipedia Servers, please try again" +
                            '</p>' + '</div>';
                        infowindow.setContent(contentInfo);
                    });
                });
        }); //End ForEach
       
	    //Linking list to markers to show info
        self.list = function(place, marker) {
            google.maps.event.trigger(place.marker, 'click');
        };
       
	    // Search functionality 
        self.query = ko.observable(''); //Creates an observable for filter
        self.searchedList = ko.computed(function() {
            return ko.utils.arrayFilter(self.locationsList(), function(
                list) {
                var listFilter = list.name.toLowerCase().indexOf(
                    self.query().toLowerCase()) >= 0;
                if (listFilter) {
                    //Show only the matches
                    list.marker.setVisible(true);
                } else {
                    list.marker.setVisible(false);
                    //Hide away markers that do not match results
                }
                return listFilter;
            });
        });
    } //ViewModel End
   
    //Create map of Ghent 

function initMap() {
        var ghent = {
            lat: 51.0543,
            lng: 3.7174
        };
        var mapOptions = {
            center: ghent,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        // Run viewModel 
        ko.applyBindings(new viewModel());
    }
    
	//Handling error for google map.

function googleError() {
        alert("Google Has Encountered An Error. Please Try Again Later");
    }
    
	//Functionality for mobile devices
var menuButton = document.querySelector('.menu-button');
var mapDiv = document.querySelector('.mapdiv');
var navBar = document.querySelector('nav');
menuButton.addEventListener('click', function(event) {
    navBar.classList.toggle('open');
    event.stopPropagation();
});
mapDiv.addEventListener('click', function() {
    navBar.classList.remove('open');
});