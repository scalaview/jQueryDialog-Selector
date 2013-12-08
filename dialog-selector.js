(function ($) {
  var che_options = []

  var buildElemntHtml = function(for_text, input_tips, but_text){
    var $block = $('<div/>', {
      id : "black_block"
    })
    var $dialog = $('<div/>', {
      id : "gen_dialog",
      style : "display:none"
    }).append($('<div class="box"></div>')
      .append($('<div/>', {
         id : "divSelecting",
        }).append($('<div/>', { 
              class : "form-inline"
            })
            .append($('<span id="selectingHeader"></span>'))
            .append($('<div/>', {class : "form-group"})
                  .append($('<label/>', {
                    class : "sr-only", 
                    for : for_text,
                  }).html('Product Name'))
                  .append($('<input/>', {
                    type : "text", 
                    class : "form-control",
                    id : "search_input",
                    placeholder : input_tips,
                  })))
              .append($('<button/>', {
                type : "submit", 
                class : "btn btn-default",
              }).html(but_text)))))

    var $sel_ = $('<div/>', {
              id : "selected-group",
            }).append($('<div class="dy-controls"></div>')).appendTo($dialog)
    var $che_ = $('<div/>', {
                id : "checkboxes-group",
              }).append('<div class="controls"></div>').appendTo($dialog)

    return [$block, $dialog]
  } 

  var str_checkbox = [ "<div class='selected-inline'><label class='selected-label'><input type='checkbox' value='", 0, "'>", 0, "</label></div>"]

  var mapping = function(val, $el){
      var t = null
      $el.each(function(i, v){
        if($(v).find('input[type="checkbox"]').val() === val){
          t = $(v)
          return false
        } 
      })
      return t
  }

  var linkage =  function($this ,$els_group){
    var $t = $this.find('input[type="checkbox"]')
    var $div = mapping($t.val(),$els_group)
    var $che = $div.find('input[type="checkbox"]')
    $che.prop('checked', !$che.prop('checked'))
    return $div
  }

  var initEventBinding = function(){
    var $sel_group = $("#selected-group").children()
    var $che_group = $("#checkboxes-group").children()
    $sel_group.on('click', 'label', function(){
      linkage($(this), $che_group.children(), true)
      $(this).parent().remove()
    })
    $che_group.on('change', 'label', function(){
      var $chk = $(this).children()
      if($chk.prop('checked')){
        str_checkbox[1] = $chk.val()
        str_checkbox[3] = $chk.parent().text()
        $sel_group.append(str_checkbox.join(""))
        linkage($(this), $sel_group.children())
      }else{
        linkage($(this), $sel_group.children()).remove()
      }
    })
    return { sel: $sel_group, che: $che_group}
  }

  var itemBuilder = function(data, $target){
    $.each(data, function(i, e){
      if(itemFilter(e)){
        $('<div/>', {
          class: "checkbox-inline"
        }).append($('<label/>', {
              class : "checkbox-label",
              for : e.val
            })
            .text(e.text)
            .prepend($('<input type="checkbox" value='+ e.val +'>'))
            ).appendTo($target)
        che_options.push($.trim(e.val) + '-' + $.trim(e.text))
      }
    })
  }

  var itemFilter = function(e){
    var flag = true;
    $.each(che_options, function(i, v){
      if($.trim(e.val) + '-' + $.trim(e.text) === v){
        flag = false;
        return;
      }
    })
    return flag
  }

  var regFinder = function($source, reg){
    $.each($source.children(), function(i, e){
      if($(e).find('label').text().search(reg) === -1){
        $(e).hide()
      }else{
        $(e).show()
      }
    })
  }
  
  var searchChanger = function($input, options, $node){
    if(options.ajax.url){
        $input.on('change', function(event){
          $this = $(this)
          var ajaxOption = $.extend(true, {data: {'terms': $this.val()}}, options.ajax)
          $.ajax(ajaxOption)
        })
    }else{
      $input.on('change', function(event){
          $this = $(this)
          regFinder($node, $this.val())
        })
    }
  }

  var initialization = function($this, options){
    if(!$this.find('div[id="black_block"]').length || !$this.find('div[id="gen_dialog"]').length || !$this.find('div[id="selected-group"]').length || !$this.find('div[id="checkboxes-group"]').length){
      $.each(buildElemntHtml(options.for_text, options.input_tips, options.but_text), function(i, e){
        $(e).appendTo($this)
      });
    }
    var init = initEventBinding();
    var $sel_group = init.sel,  $che_group = init.che;
    itemBuilder(options.dataOptions, $che_group)
    searchChanger($("#search_input"), options, $che_group)
  }
  
  return $.fn.dialogSelector = function(options, callBack) {
      var defaults = {
        for_text: 'Demo',
        input_tips: 'Tips',
        but_text: 'Buttion',
        item_num: 5,
        line_count: 4,
        width: 500,
        height: 333,
        dataOptions: [],
        close: function(event, ui){$("#black_block").hide()}, //不能被覆盖
        ajax : {
          type: 'GET',
          url: '',
          dataType: 'json',
          success: function(data){
             var items = callBack != null ? callBack(data) : data
             var $node = $("#checkboxes-group").children()
             itemBuilder(items, $node)
             regFinder($node, $("#search_input").val())
          },
          error : function(xhr, status) {
              console.log("xhr: "+ xhr+", status: "+ status)
          },
        },
      }

      var $this = $(this)
      options = $.extend(true, defaults, options);
      initialization($this, options)
      $this.click(function(){
          $("#black_block").show();       
          $("#gen_dialog" ).dialog({
            width: options.width,
            height: options.height,
            close: options.close,
          });
        })
    };
})(jQuery);