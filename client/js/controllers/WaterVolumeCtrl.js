Brewday.controller('WaterVolumeCtrl', ['WaterService',
        function(WaterService){
            var waterVol = this;
            waterVol.WaterService = WaterService;
        }
])
