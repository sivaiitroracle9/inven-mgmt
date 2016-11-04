$("#nav-jstree").jstree();
$('#nav-jstree').on("changed.jstree", function (e, data) {
    console.log(data.selected);
  });
  // 8 interact with the tree - either way is OK
  $('button').on('click', function () {
    $('#nav-jstree').jstree(true).select_node('child_node_1');
    $('#nav-jstree').jstree('select_node', 'child_node_1');
    $.jstree.reference('#nav-jstree').select_node('child_node_1');
  });