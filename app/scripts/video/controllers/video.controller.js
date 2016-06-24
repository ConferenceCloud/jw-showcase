/**
 * Copyright 2015 Longtail Ad Solutions Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 **/

(function () {

    angular
        .module('app.video')
        .controller('VideoController', VideoController);

    /**
     * @ngdoc controller
     * @name app.video.controller:VideoController
     *
     * @requires $state
     * @requires $stateParams
     * @requires $timeout
     * @requires app.core.dataStore
     * @requires app.core.utils
     */
    VideoController.$inject = ['$state', '$stateParams', '$timeout', 'utils', 'feed', 'item'];
    function VideoController ($state, $stateParams, $timeout, utils, feed, item) {

        var vm = this,
            mouseMoveTimeout;

        vm.item              = item;
        vm.feed              = feed;
        vm.duration          = 0;
        vm.isPlaying         = false;
        vm.controlsVisible   = true;
        vm.facebookShareLink = composeFacebookLink();
        vm.twitterShareLink  = composeTwitterLink();

        vm.onReady    = onPlayerEvent;
        vm.onPlay     = onPlayerEvent;
        vm.onPause    = onPlayerEvent;
        vm.onComplete = onPlayerEvent;
        vm.onError    = onPlayerEvent;

        vm.onCardClickHandler = onCardClickHandler;
        vm.mouseMoveHandler   = mouseMoveHandler;

        activate();

        ////////////////////////

        /**
         * Initialize the controller.
         */
        function activate () {

            vm.duration = utils.getVideoDurationByItem(vm.item);

            vm.feed.playlist = vm.feed.playlist.filter(function (item) {
                return item.mediaid !== vm.item.mediaid;
            });

            vm.playerSettings = {
                width:       '100%',
                height:      '100%',
                aspectratio: '16:9',
                autostart:   $stateParams.autoStart,
                playlist:    [{
                    mediaid:     vm.item.mediaid,
                    title:       vm.item.title,
                    description: vm.item.description,
                    image:       vm.item.image,
                    sources:     vm.item.sources,
                    tracks:      vm.item.tracks
                }],
                sharing:     false
            };
        }

        /**
         * Handle player event
         * @param event
         */
        function onPlayerEvent (event) {

            vm.isPlaying       = 'play' === event.type;
            vm.controlsVisible = !vm.isPlaying;
        }

        /**
         * Handle mouse move event
         */
        function mouseMoveHandler () {

            if (!vm.controlsVisible) {
                vm.controlsVisible = true;
            }

            $timeout.cancel(mouseMoveTimeout);
            mouseMoveTimeout = $timeout(function () {
                if (true === vm.isPlaying) {
                    vm.controlsVisible = false;
                }
            }, 4000);
        }

        /**
         * Handle click event on card
         *
         * @param {Object}      item        Clicked item
         * @param {boolean}     autoStart   Should the video playback start automatically
         */
        function onCardClickHandler (item, autoStart) {

            $state.go('root.video', {
                feedId:    item.feedid,
                mediaId:   item.mediaid,
                autoStart: autoStart
            });
        }

        /**
         * Compose a Facebook share link with the current URL
         *
         * @returns {string}
         */
        function composeFacebookLink () {

            var facebookShareLink = 'https://www.facebook.com/sharer/sharer.php?p[url]={url}';

            return facebookShareLink
                .replace('{url}', encodeURIComponent(window.location.href));
        }

        /**
         * Compose a Twitter share link with the current URL and title
         *
         * @returns {string}
         */
        function composeTwitterLink () {

            var twitterShareLink = 'http://twitter.com/share?text={text}&amp;url={url}';

            return twitterShareLink
                .replace('{url}', encodeURIComponent(window.location.href))
                .replace('{text}', encodeURIComponent(item.title));
        }
    }

}());