
/* ***************************************** ui change *******************************************/

function addMenuItem(w) {
  var $=w.$
  $.init(w.document)
  
  var menuitem = $(menuProps.id);
  menuitem && menuitem.remove();

  var restartMenuItem = $("<menuitem>");
  if(restartMenuItem){
    restartMenuItem.attr("id", menuProps.id);
    restartMenuItem.attr("label",menuProps.label);
    restartMenuItem.attr("accesskey", menuProps.accesskey);
    restartMenuItem.attr("key", menuProps.key);
    // restartMenuItem.attr("oncommand", menuProps.command);
    restartMenuItem.bind("command", function(event) {
      restartCommand();
    });
    
    var menu_FilePopup=$("menu_FilePopup")
    if(menu_FilePopup) menu_FilePopup.insertBefore(restartMenuItem, $("menu_FileQuitItem"));
  }
}

function addKeyboardShortcut(w){
  var $=w.$
  $.init(w.document)
  
  var keyset=$("<keyset>")
  if(keyset){
    var key = $("<key>");
    if(key){
      key.attr("id", shortcutProps.id);
      key.attr("key", shortcutProps.key);
      key.attr("modifiers", shortcutProps.modifiers);
      // key.attr("oncommand", shortcutProps.command);
      key.attr("oncommand", "void(0);");
      key.bind("command", function(event) {
        restartCommand();
      });
      keyset.append(key);
    }
    
    keyset.attr("id","restartKeyset")
    w.document.documentElement.append(keyset)
  }
}

function removeMenuItem(w) {
  var $=w.$
  $.init(w.document)
  var menuitem=$(menuProps.id)
  menuitem && menuitem.remove()
}

function removeKeyboardShortcut(w){
  var $=w.$
  $.init(w.document)
  var keyset=$("restartKeyset")
  keyset && keyset.remove()
}
