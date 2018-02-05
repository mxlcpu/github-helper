// ==UserScript==
// @name         淘宝搜索助手
// @namespace    https://github.com/yeomanye
// @version      0.1.0
// @description  保留淘宝搜索的筛选条件并自动运用
// @require      https://greasyfork.org/scripts/34143-debug/code/debug.js?version=246342
// @author       Ming Ye
// @match        https://s.taobao.com/search*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    myDebugger.debugD = false;
    var log = myDebugger.consoleFactory("taobao-assistant","log",null);
    var debugTrue = myDebugger.debugTrue; 
    var interval;
    var tagClickHandler = function(evt){
        var parent = evt.target.parentNode;
        var className = parent.className;
        if(className.indexOf('icon-tag') < 0 || className.indexOf('J_Ajax') < 0) return;
        //延时，保证能够正确的读取到
        setTimeout(function(){
            var aElms = document.querySelectorAll('.crumb.g-clearfix .icon-tag.J_Ajax');
            var arr = [];
            for(var i=0,len=aElms.length;i<len;i++){
                var tmpArr = aElms[i].dataset.value.split(':');
                arr.push(tmpArr[0]+'%3A'+tmpArr[1]);
            }
            log.logObj('arr',arr);
            localStorage.setItem('preSeaTag',JSON.stringify(arr));
            createTag();
        },500);
    };
    var createTag = function(){
        var panel = document.querySelector('.crumb.g-clearfix');
        if(!panel || panel.length === 0) {
            clearInterval(interval);
            return interval = setInterval(createTag,100);
        }
        clearInterval(interval);
        var newA = document.createElement('a');
        newA.href = '#';
        newA.innerText = '恢复筛选';
        newA.className = 'icon-tag toggle-btn';
        panel.appendChild(newA);
        newA.addEventListener('click',searchTags);
    };
    var init = function(){
        document.body.addEventListener('click',tagClickHandler);
        createTag();
    };
    var searchTags = function(){
        var preTagArr = JSON.parse(localStorage.getItem('preSeaTag'));
        var tagElms = document.querySelectorAll('.icon-tag.J_Ajax');
        var tagArr = [];
        for(var i=0,len=tagElms.length;i<len;i++){
            tagArr.push(tagElms[i].getAttribute('trace-click'));
        }
        var queryStr = '&cps=yes&ppath=',len = queryStr.length;
        preTagArr.forEach(function(str){
            if(tagArr.indexOf('cps:yes_s;ppath:'+str) >= 0)queryStr+=str+'%';
        });
        queryStr = queryStr.substr(0,queryStr.length-1);
        if(queryStr.length !== len - 1)
        location.search += queryStr;
    };
    var arrayIsEq = function(arr1,arr2){
        if(!arr1 || !arr2) return false;
        var len1 = arr1.length,len2 = arr2.length;
        if(len1 !== len2) return false;
        for(var i=0;i<len1;i++){
            if(arr1[i]!==arr2[i])return false;
        }
        return true;
    };
    init();
    // saveTagArr();
    // searchTags();
})();