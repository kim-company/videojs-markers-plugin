/*! videojs-markers !*/

(function() {
  //default 
  var defaults = {
      markerStyle:{
        'width':'10px',
        'border-radius': '40%',
        'background-color': 'red'

      },
      breakOverlay:{
        display: false,
        display_time: 3,
        default_text: "Break overlay",
        style:{
          'width':'100%',
          'height': '20%',
          'background-color': 'rgba(0,0,0,0.7)',
          'color': 'white',
          'font-size': '17px',
        }

      },
      markerTip:{
        display: true,
        default_text: "Break"
      }
      
    };


  /**
   * register the markers plugin (dependent on jquery)
   */
  videojs.plugin('markers', function(options) {
    console.log("enter marker");
    var marker_holder, player, setting, video_wrapper;
   
    
    setting = $.extend(true, {}, defaults, options.setting);
    console.log(this);
    video_wrapper = $("#"+setting.videoID);
    player = this;


    var loadMarkers = function(){
      console.log("creating markers");
      var duration = player.duration();

      marker_holder = [];
      // create the each marker div
      $.each(options.breaks, function(key,time){

        var m_h, m, time, marker_time, pos;
        m = $("<div class='vjs-marker'  id='"+key+"'></div>");
        m.css(setting.markerStyle);
     
        m.css("margin-left", -parseFloat(m.css("width"))/2 +'px'); 
        video_wrapper.find('.vjs-progress-control').append(m);
        
        // position the marker to correct time position 
        pos = (time/duration)*100;
        m.css("left", pos +'%');  

        marker_holder.push({div: m, time: time, pos:pos});

      });
      console.log(marker_holder);
    
      //bind click event to seek to marker time
      video_wrapper.find('.vjs-marker').on('click', function(e){
        marker_id = this.id;
        player.currentTime(marker_holder[marker_id].time);
      });


      if(setting.markerTip.display){
        var marker_tip;
         //create div for marker tip
        console.log("creating marker tip");
        marker_tip = $("<div class='vjs-tip'><div class='vjs-tip-arrow'></div><div class='vjs-tip-inner'></div></div>");
        video_wrapper.find('.vjs-progress-control').append(marker_tip);

        //bind events to show marker tip
        video_wrapper.find('.vjs-marker').on('mouseover', function(event){
          var marker_id;
          marker_id = this.id;

          marker_tip.find('.vjs-tip-inner').html(setting.markerTip.default_text + ": " + marker_holder[marker_id].time);
    

          //margin left needs to minus the padding length
          marker_tip.css({"left": marker_holder[marker_id].pos+'%',
                          "margin-left": -parseFloat(marker_tip.css("width"))/2-5 +'px',
                          "visibility": "visible"});
          return;
        }).on('mouseout',function(){
          marker_tip.css("visibility", "hidden");
        });

      }
      
      if(setting.breakOverlay.display){
        var break_overlay, ct, overlay_index;
        //create div for break overlay
        break_overlay = $("<div class='vjs-break-overlay'><div class='vjs-break-overlay-text'></div></div>");
        break_overlay.css(setting.breakOverlay.style);
        video_wrapper.append(break_overlay);
        overlay_index = -1;

        //bind timeupdate handle
        player.on("timeupdate", function() {
          ct = this.currentTime();
          //first check if the playback is still within the same break period
          if(overlay_index != -1){
            if(ct < marker_holder[overlay_index].time || 
               ct > (marker_holder[overlay_index].time+setting.breakOverlay.display_time)){
              overlay_index = -1;
              break_overlay.css("visibility", "hidden");
            }
              

          }else{
            //display overlay from marker.time till +breakOverlay.time
            $.each(marker_holder, function(key, val){
              if(ct >= val.time && ct <= (val.time+setting.breakOverlay.display_time)){
                overlay_index = key;
                break_overlay.find('.vjs-break-overlay-text').html(setting.breakOverlay.default_text + ": " + (overlay_index+1));
    
                break_overlay.css("visibility", "visible");
                return false;
              }

            });

          }


        }, false);

      }
    }
    this.on("loadedmetadata", loadMarkers);

  });
  


})();