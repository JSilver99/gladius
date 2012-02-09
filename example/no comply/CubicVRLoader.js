(function() {
  var dir = ".";
  
  var loadScene = function(sceneObj, directory) {
    dir = directory || ".";
    var type = "JSON";
    var scene;
    if (typeof sceneObj === "string") {
      if (sceneObj.indexOf(".js") !== -1)
        sceneObj = CubicVR.util.getJSON(sceneObj);
      else if (sceneObj.indexOf(".dae") !== -1)
        type = "COLLADA";
      else
        sceneObj = JSON.parse(sceneObj);
    }
    if (type === "JSON") {
      scene = new CubicVR.Scene();
      loadSceneObjects(scene, sceneObj, sceneObj.sceneObjects, "Scene");
      loadOther(sceneObj.other);
    } else if (type === "COLLADA") {
      scene = CubicVR.loadCollada(sceneObj);
    }
    return scene;
  };
  
  var loadOther = function(other) {
    if (other && other.globalAmbient) {
      CubicVR.setGlobalAmbient(other.globalAmbient);
    } else {
      CubicVR.setGlobalAmbient([0.4, 0.4, 0.4]);
    }
  }
  
  var loadSceneObjects = function(parent, sceneObj, sceneObjects, type) {
    for (var i=0; i<sceneObjects.length; ++i) {
      var obj = sceneObjects[i];
      if (typeof obj.mesh === "string")
        obj.mesh = sceneObj.meshes[obj.mesh];
      var mesh = obj.mesh;
      obj.mesh = new CubicVR.Mesh();
      for (var key in mesh)
        obj.mesh[key] = mesh[key];
      if (obj.materials && obj.materials.length) {
        obj.mesh.materials = obj.materials;
        obj.materials = undefined;
      }
      for (var j=0; j<obj.mesh.materials.length; ++j) {
        var matID = obj.mesh.materials[j];
        var material = sceneObj.materials[matID];
        for (var k in material.textures) {
          if (material.textures.hasOwnProperty(k)) {
            var ref = material.textures[k];
            var texture = CubicVR.Textures_obj[CubicVR.Textures_ref[ref]];
            if (!texture) {
              var textureSrc = sceneObj.textures[ref] || ref;
              if (textureSrc.substr(0, 2) === "./") {
                textureSrc = dir + textureSrc.substr(1, textureSrc.length-1);
              }
              var textureImg = new Image();
              textureImg.src = textureSrc;
              texture = new CubicVR.Texture(textureImg);
              CubicVR.Textures_ref[ref] = texture.tex_id;
            }
            material.textures[k] = texture;
          }
        }
        obj.mesh.materials[j] = new CubicVR.Material();
        for (var key in material)
          obj.mesh.materials[j][key] = material[key];
      }
      obj.mesh.compile();
      var children = obj.children;
      obj.children = null;
      var sceneObject = new CubicVR.SceneObject(obj);
      if (children) loadSceneObjects(sceneObject, sceneObj, children, "SceneObject");
      if (type === "Scene") parent.bindSceneObject(sceneObject);
      else if (type === "SceneObject") parent.bindChild(sceneObject);
    }
  };
  
  window.CubicVRLoader = {
    loadScene: loadScene
  };
})();