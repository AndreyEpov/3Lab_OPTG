
var container;
var camera, scene, renderer;
var imagedata;
var geometry;
var spotlight = new THREE.PointLight(0xaaff00,8,100,2);
var light = new THREE.DirectionalLight(0xffff00);
var sphere;
var N = 350;
var mixer, morphs = [];  
var clock = new THREE.Clock();
var mtlLoader;
var defaultLook = new THREE.Vector3( N/2, 0.0, N/2);

var parrotPath; 
var storkPath; 
var keyboard = new THREEx.KeyboardState();
var T=10.0;
var t=0.0;
var followParrot = false;
var followStork = false;
var axisY = new THREE.Vector3(0,1,0);
var axisZ= new THREE.Vector3(0,0,1);
var stork;

init();
animate();
 
function init()
{
    
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );    
    camera.position.set(N/2, N/2, N*1.5); 
    camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));    
    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x444444, 1);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;


    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
/*
    spotlight.position.set(N*2, N*2, N/2);
    var spotlight.targetObject = new THREE.Object3D();
    targetObject.position.set(N,0,N);
    scene.add(targetObject);

    spotlight.target = targetObject;
    
    spotlight.castShadow = true;

    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;

    spotlight.shadow.camera.near = 500;
    spotlight.shadow.camera.far = 4000;
    spotlight.shadow.camera.fov = 90;
    */
   light.position.set(N*2, N/2, N/2 );
    // направление освещения
    light.target = new THREE.Object3D();
    light.target.position.set( 0, 5, 0 );
    scene.add(light.target);
    // включение расчёта теней
    light.castShadow = true;
    // параметры области расчёта теней
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 60, 1, 1, 2500 ) );
    light.shadow.bias = 0.0001;
    // размер карты теней
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    scene.add( light );
    var helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper);
   
    scene.add(spotlight);
   /* var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );
 */addSky();
    
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = new Image();
    mixer = new THREE.AnimationMixer( scene );
    img.onload = function()
    {    
        canvas.width = img.width;    
        canvas.height = img.height;    
        context.drawImage(img, 0, 0 );    
        imagedata = context.getImageData(0, 0, img.width, img.height);
       
        CreateTerrain();
        loadModel('models/trees/palma/', "Palma 001.obj", "Palma 001.mtl");
        loadModel('models/trees/tree/', "Tree.obj", "Tree.mtl");
       // loadModel('models/trees/hvoya/', "needle01.obj", "needle01.mtl");
        
  
     


    }
    parrotPath=addTraektoryP();
    storkPath=addTraektoryS();
    loadAnimatedModel('models/Parrot.glb',parrotPath);
    loadAnimatedModel('models/Stork.glb',storkPath);
    img.src = 'pics/lake.jpg';
    
}
 
 
function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var a = 0.0;

function animate()
{
    var delta = clock.getDelta();
    mixer.update(delta);
    t+=delta;
    a += 0.001;
    
    for ( var i = 0; i < morphs.length; i ++ )
    {
    
         var morph = morphs[ i ];
         var pos = new THREE.Vector3();
         if (t>=T)t=0.0;
         pos.copy(morph.controlled.getPointAt(t/T));
         morph.mesh.position.copy(pos);

         spotlight.position.copy(pos);

         var nextPoint = new THREE.Vector3();
         if ((t+0.001)>=T)t=0.0;
         nextPoint.copy(morph.controlled.getPointAt((t+0.001)/T)); 

         morph.mesh.lookAt(nextPoint);
         if (followParrot&& i==0)
         {
            var relativeCameraOffset = new THREE.Vector3(0,50,-150);
            var m1 = new THREE.Matrix4();
            var m2 = new THREE.Matrix4();
            // получение поворота объекта
            m1.extractRotation( morph.mesh.matrixWorld);
            // получение позиции объекта
            m2.copyPosition( morph.mesh.matrixWorld);
            m1.multiplyMatrices(m2, m1);
            // получение смещения позиции камеры относительно объекта
            var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
            // установка позиции и направления взгляда камеры
            camera.position.copy(cameraOffset);
            camera.lookAt( morph.mesh.position );
            
         }
         if (followStork&& i==1)
         {
            var relativeCameraOffset = new THREE.Vector3(0,50,-150);
            var m1 = new THREE.Matrix4();
            var m2 = new THREE.Matrix4();
            // получение поворота объекта
            m1.extractRotation( morph.mesh.matrixWorld);
            // получение позиции объекта
            m2.copyPosition( morph.mesh.matrixWorld);
            m1.multiplyMatrices(m2, m1);
            // получение смещения позиции камеры относительно объекта
            var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
            // установка позиции и направления взгляда камеры
            camera.position.copy(cameraOffset);
            camera.lookAt( morph.mesh.position );
            
         }
         /*
         if ((followStork==true)||(followParrot==true))
         {
            var relativeCameraOffset = new THREE.Vector3(0,50,-150);
            var m1 = new THREE.Matrix4();
            var m2 = new THREE.Matrix4();
            // получение поворота объекта
            m1.extractRotation( morph.mesh.matrixWorld);
            // получение позиции объекта
            m2.copyPosition( morph.mesh.matrixWorld);
            m1.multiplyMatrices(m2, m1);
            // получение смещения позиции камеры относительно объекта
            var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
            // установка позиции и направления взгляда камеры
            camera.position.copy(cameraOffset);
            camera.lookAt( morph.mesh.position );
            
         }
         /*else if (model.mesh == null)
         {
            stork=model.mesh ;
            var relativeCameraOffset = new THREE.Vector3(0,50,-150);
            var m1 = new THREE.Matrix4();
            var m2 = new THREE.Matrix4();
            // получение поворота объекта
            m1.extractRotation( stork.matrixWorld);
            // получение позиции объекта
            m2.copyPosition( stork.matrixWorld);
            m1.multiplyMatrices(m2, m1);
            // получение смещения позиции камеры относительно объекта
            var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
            // установка позиции и направления взгляда камеры
            camera.position.copy(cameraOffset);
            camera.lookAt( stork.position );
            stork.translateZ(50*delta);
            
            if(keyboard.pressed("a"))
            {
                stork.rotateOnAxis(axisY,Math.PI/30.0);
                stork.rotateOnAxis(axisZ,-Math.PI/30.0);
                stork.rotateOnAxis(axisY,-Math.PI/30.0);
                stork.rotateOnAxis(axisZ,Math.PI/30.0);
            }
            
            if(keyboard.pressed("d"))
            {
                stork.rotateOnAxis(axisY,-Math.PI/30.0);
                stork.rotateOnAxis(axisZ,-Math.PI/30.0);
                stork.rotateOnAxis(axisY,Math.PI/30.0);
                stork.rotateOnAxis(axisZ,Math.PI/30.0);
            }
            if(keyboard.pressed("left"))
            {
              
               stork.rotateOnAxis(axisY,Math.PI/30.0);
              
            }
            
            if(keyboard.pressed("right"))
            {
                stork.rotateOnAxis(axisY,-Math.PI/30.0);
            }
                     

         }*/  
    
    }
    if(keyboard.pressed("1"))
    {
        followParrot = false;
        followStork = false;
        camera.position.set(N/2, N/2, N*1.5); 
        camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));
    }
    if(keyboard.pressed("2"))
    {
        followParrot = true;
        followStork = false;
    }
    if(keyboard.pressed("3"))
    {
        followParrot = false;
        followStork = true;
    } 
    requestAnimationFrame( animate );
    render();
}
function render()
{
    renderer.render( scene, camera );
}
 
function CreateTerrain()
{
    geometry = new THREE.Geometry();
 
    for (var i=0; i < N; i++)
        for (var j=0; j < N; j++)
        {
            var position = getPixel( imagedata, i, j );
            geometry.vertices.push(new THREE.Vector3( i, position/10.0, j));
        }

    for(var i = 0; i < N - 1; i++){
        for(var j = 0; j < N - 1; j++){
            var vertex1 =  i + j * N;
            var vertex2 = (i + 1) + j * N;
            var vertex3 = i + (j + 1) * N;
            var vertex4 = (i + 1) + (j + 1) * N;

            geometry.faces.push(new THREE.Face3(vertex1, vertex2, vertex4));
            geometry.faces.push(new THREE.Face3(vertex1, vertex4, vertex3));

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),
                new THREE.Vector2(i/(N-1), (j+1)/(N-1))
            ]);
        } 
    }
        
    geometry.computeFaceNormals();  
    geometry.computeVertexNormals();

    var loader = new THREE.TextureLoader();
    var tex = loader.load( 'pics/grasstile.jpg' );
        
    var mat = new THREE.MeshLambertMaterial({    
        map: tex,    
        wireframe: false,    
        side: THREE.DoubleSide 
    });
 
    var matMesh = new THREE.Mesh(geometry, mat); 
    matMesh.receiveShadow = true;
    scene.add(matMesh);
}

function getPixel( imagedata, x, y )  
{    
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;    
    return data[ position ];
}
function loadModel(path, oname, mname)
{
    // функция, выполняемая в процессе загрузки модели (выводит процент загрузки)
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };
        // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var onError = function ( xhr ) { };
        // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( path );
        // функция загрузки материала
    mtlLoader.load( mname, function( materials )
        {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( path );
       

            // функция загрузки модели
            objLoader.load( oname, function ( object )
            {
               

                object.castShadow = true;
                object.traverse( function ( child )
                    {
                        if ( child instanceof THREE.Mesh )
                            {
                                 child.castShadow = true;
                            }
                    } );

                for (var i = 0; i<10;i++)
                {
                    var x = Math.random()*N;
                    var z = Math.random()*N;
                    var y = geometry.vertices[Math.round(z)+Math.round(x)*N].y;
                    object.position.x = x;
                    object.position.y = y;
                    object.position.z = z;
                    //object.scale.set(2, 2, 2);
                    var s =((Math.random()*100)+30)/400;
                    object.scale.set(s,s,s);
                    scene.add(object.clone());
                }
            }, onProgress, onError );
        });
    
        
}
function loadAnimatedModel(path,controlled) //где path – путь и название модели
        {
            var loader = new THREE.GLTFLoader();
        
            loader.load( path, function ( gltf ) {
                var mesh = gltf.scene.children[ 0 ];
                var clip = gltf.animations[ 0 ];
                //установка параметров анимации (скорость воспроизведения и стартовый фрейм)
                mixer.clipAction( clip, mesh ).setDuration( 1 ).startAt( 0 ).play();
                mesh.position.set( N/2, N/5, N/2 );
                //mesh.position.set( 20, 40, 20 );
                mesh.rotation.y = Math.PI / 8;
                mesh.scale.set( 0.2, 0.2, 0.2 );
                //mesh.scale.set( 2, 2, 2 );
                mesh.castShadow = true;
               // mesh.receiveShadow = true;
                
                scene.add( mesh );
                var model={};
                model.mesh = mesh;
                model.controlled = controlled;
                morphs.push( model );
                /*
                if (controlled==false)   
                    morphs.push( mesh );
                else
                    stork = mesh;
                    */
            } );
        }
function addTraektoryP()
{
    var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 60, 50, 170 ), //P0
        new THREE.Vector3( 75, 50, 50 ), //P1
        new THREE.Vector3( 225, 50, 50 ), //P2
        new THREE.Vector3( 240, 50, 175 ) //P3
       );
    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 240, 50, 180 ), //P3
        new THREE.Vector3( 225, 50, 300 ), //P2
        new THREE.Vector3( 75, 50, 300 ), //P1     
        new THREE.Vector3( 60, 50, 180 ) //P0
       );
       var vertices = [];
       // получение 20-ти точек на заданной кривой
       vertices = curve.getPoints( 20 );
       vertices = vertices.concat(curve2.getPoints( 20 ));

       // создание кривой по списку точек
       var path = new THREE.CatmullRomCurve3(vertices);
       // является ли кривая замкнутой (зацикленной)
       path.closed = true;
        vertices = path.getPoints(500);
       var geometry = new THREE.Geometry();
       geometry.vertices = vertices;
       
       var material = new THREE.LineBasicMaterial( { color : 0xffff00 } );
       var curveObject = new THREE.Line( geometry, material );
      // scene.add(curveObject);
              return path;
}
function addTraektoryS()
{
    var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 60, 120, 170 ), //P0
        new THREE.Vector3( 75, 90, 50 ), //P1
        new THREE.Vector3( 225, 90, 50 ), //P2
        new THREE.Vector3( 240, 120, 175 ) //P3
       );
    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 240, 120, 180 ), //P3
        new THREE.Vector3( 225, 90, 300 ), //P2
        new THREE.Vector3( 75, 90, 300 ), //P1     
        new THREE.Vector3( 60, 120, 180 ) //P0
       );
       var vertices = [];
       // получение 20-ти точек на заданной кривой
       vertices = curve.getPoints( 20 );
       vertices = vertices.concat(curve2.getPoints( 20 ));

       // создание кривой по списку точек
       var path = new THREE.CatmullRomCurve3(vertices);
       // является ли кривая замкнутой (зацикленной)
       path.closed = true;
        vertices = path.getPoints(500);
       var geometry = new THREE.Geometry();
       geometry.vertices = vertices;
       
       var material = new THREE.LineBasicMaterial( { color : 0x00ff00 } );
       var curveObject = new THREE.Line( geometry, material );
      // scene.add(curveObject);
              return path;
}
function addSky()
    {
    //создание геометрии сферы
    var geometry = new THREE.SphereGeometry( 1000, 32, 32 );
    //загрузка текстуры
    var loader = new THREE.TextureLoader();
    //создание материала
    var material = new THREE.MeshBasicMaterial({
    map: loader.load( "pics/sky.jpg" ),
    side: THREE.DoubleSide
    });
    //создание объекта
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 162.5;
    sphere.position.z = 162.5;
    sphere.rotation.y = a;
    //размещение объекта в сцене
    scene.add( sphere );
    } 