
var container;
var camera, scene, renderer;
var imagedata;
var geometry;
var spotlight = new THREE.PointLight(0xaaff00);
var sphere;
var N = 350;
var mixer, morphs = [];   
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

    spotlight.position.set(N*2, N*2, N/2);
    var targetObject = new THREE.Object3D();
    targetObject.position.set(N,0,N);
    scene.add(targetObject);

    spotlight.target = targetObject;
    
    spotlight.castShadow = true;

    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;

    spotlight.shadow.camera.near = 500;
    spotlight.shadow.camera.far = 4000;
    spotlight.shadow.camera.fov = 90;
    var helper = new THREE.CameraHelper(spotlight.shadow.camera);
    scene.add(helper);
   
    scene.add(spotlight);
   /* var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );
 */
    mixer = new THREE.AnimationMixer( scene );
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = new Image();

    img.onload = function()
    {    
        canvas.width = img.width;    
        canvas.height = img.height;    
        context.drawImage(img, 0, 0 );    
        imagedata = context.getImageData(0, 0, img.width, img.height);
       
        CreateTerrain();
        loadModel('models/trees/palma/', "Palma 001.obj", "Palma 001.mtl");
        loadModel('models/trees/tree/', "Tree.obj", "Tree.mtl");
        loadModel('models/trees/hvoya/', "needle01.obj", "needle01.mtl");
        
        loadAnimatedModel('models/bird/Parrot.glb');

       
    }
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
    
   /* var delta = clock.getDelta();
    mixer.update( delta );
    for ( var i = 0; i < morphs.length; i ++ )
    {
         var morph = morphs[ i ];
    }
*/
    requestAnimationFrame( animate );
    render();
    /*
    spotlight.position.x = N/2+N*Math.cos(a);
    spotlight.position.y = N*Math.sin(a);
    sphere.position.copy(spotlight.position);


    var x = N/2 + 2*N*Math.cos(a);
    var z = N/2 + 2*N*Math.sin(a);

    camera.position.set(x, N/2, z);
 
    camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));
*/
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
                    var y = geometry.vertices[Math.round(x)+Math.round(z)*N].y;
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
function loadAnimatedModel(path) //где path – путь и название модели
        {
            var loader = new THREE.GLTFLoader();
        
            loader.load( path, function ( gltf ) {
                var mesh = gltf.scene.children[ 0 ];
                var clip = gltf.animations[ 0 ];
                //установка параметров анимации (скорость воспроизведения и стартовый фрейм)
                mixer.clipAction( clip, mesh ).setDuration( 1 ).startAt( 0 ).play();
                mesh.position.set( N/2, N/5, N/2 );
                mesh.rotation.y = Math.PI / 8;
               // mesh.scale.set( 0.2, 0.2, 0.2 );
                mesh.scale.set( 2, 2, 2 );
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                scene.add( mesh );
                morphs.push( mesh );
            
            } );
        }