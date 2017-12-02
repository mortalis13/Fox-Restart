
const {classes: Cc, interfaces: Ci, utils: Cu}=Components

Cu.import("resource://gre/modules/Services.jsm")
Cu.import("resource:///modules/CustomizableUI.jsm");

/* ******************************************* vars *********************************************** */

const prefsPrefix="extensions.fox_restart_qwe."
const chromeRoot="fox-restart"

const buttonProps={
  id:"restart-custom-button",
  className:"toolbarbutton-1 chromeclass-toolbar-additional",
  label:"Restart",
  tooltip:"Restart"
}
const menuProps={
  id:"menu_FileRestartItem",
  label:"Restart",
  // accesskey:"R",
  key:"key_Restart",
  // command:"Application.restart()"
  command:"restartCommand()"
}
const shortcutProps={
  id:menuProps.key,
  key:"R",
  modifiers:"alt",
  command:menuProps.command
}

var self=this,prefs={}
const prefNames=["firstRun","addBranch","installReason","uninstallReason","startupReason","shutdownReason",
        "buttonPos","currentSet","currentSetAfter","savedCurrentSet"]
for(var p of prefNames) prefs[p]=prefsPrefix+p

const reasons=["","APP_STARTUP","APP_SHUTDOWN","ADDON_ENABLE","ADDON_DISABLE","ADDON_INSTALL","ADDON_UNINSTALL","ADDON_UPGRADE","ADDON_DOWNGRADE"]
const styleSheets=["chrome://"+chromeRoot+"/skin/style.css"]

/* ***************************************** main functions ************************************************* */

function install(data,reason){ 
}

function startup(data,reason){
  include(data, "content/lib.js")
  include(data, "content/ui.js")
  include(data, "content/main.js")
  
  this._ss =Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
  this._uri = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(styleSheets[0], null, null);
  this._ss.loadAndRegisterSheet(this._uri, this._ss.USER_SHEET);
  
  CustomizableUI.createWidget({
    id : buttonProps.id,
    defaultArea : CustomizableUI.AREA_NAVBAR,
    label : buttonProps.label,
    tooltiptext : buttonProps.tooltip,
    onCommand: function(event) {
      restartCommand();
    },
    // onCreated: function(aNode){
    //   aNode.setAttribute('oncommand', menuProps.command)
    // }
  });
  
  eachWindow(loadIntoWindow)
  Services.ww.registerNotification(windowWatcher)
}

function shutdown(data,reason){
  CustomizableUI.destroyWidget(buttonProps.id);
  
  if (this._ss.sheetRegistered(this._uri, this._ss.USER_SHEET)) {
    this._ss.unregisterSheet(this._uri, this._ss.USER_SHEET);
  }
  
  if(reason==ADDON_DISABLE){
    Services.ww.unregisterNotification(windowWatcher)
    eachWindow(unloadFromWindow)                        //ui destroying function
  }
}

/* ****************************************** add functions ************************************************ */

function include(data, path){                          //load scripts
  Services.scriptloader.loadSubScript(data.resourceURI.spec + path, self)
}

function pref(name,value){                            //get/set prefs
  if(value===undefined){
    switch(Services.prefs.getPrefType(name)){
      case 0:return null
      case 32:return Services.prefs.getCharPref(name)
      case 64:return Services.prefs.getIntPref(name)
      case 128:return Services.prefs.getBoolPref(name)
    }
  }
  if(value==="") Services.prefs.clearUserPref(name)
  else{
    switch(typeof value){
      case "boolean":Services.prefs.setBoolPref(name,value);return
      case "number":Services.prefs.setIntPref(name,value);return
      default:Services.prefs.setCharPref(name,value)
    }
  }
}

function restartCommand(){
  const app = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  if (app) {
    try {
      const abortQuit = Components.classes["@mozilla.org/supports-PRBool;1"].createInstance(Components.interfaces.nsISupportsPRBool);
      app.notifyObservers(abortQuit, "quit-application-requested", "restart");
      if (abortQuit.data) {
        return;
      }
    } catch (e) {}
  }

  const wins = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getEnumerator(null);
  while (wins.hasMoreElements()) {
    var wNext = wins.getNext();
    if (("tryToClose" in wNext) && !wNext.tryToClose()) {
      return;
    }
  }

  Components.classes["@mozilla.org/toolkit/app-startup;1"]
    .getService(Components.interfaces.nsIAppStartup)
    .quit(Components.interfaces.nsIAppStartup.eRestart | Components.interfaces.nsIAppStartup.eAttemptQuit);
}
