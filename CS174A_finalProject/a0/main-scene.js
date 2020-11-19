

window.Cube = window.classes.Cube =
    class Cube extends Shape {
        constructor(capsuleInitA = Vec.of(0, 0, 0, 1), capsuleInitB = Vec.of(0, 0, 0, 1), initialTransformation = Mat4.identity()) {
            super("positions", "normals");
            this.positions.push(...Vec.cast(
                [-1, -1, -1], [1, -1.0, -1], [-1, -1.0, 1], [1, -1.0, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
                [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
                [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]));

            this.normals.push(...Vec.cast(
                [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
                [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
                [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]));


            this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
                14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);


            this.root = Vec.of(0, 0, 0, 1);
            this.capsuleCollisionInitialA = capsuleInitA;
            this.capsuleCollisionInitialB = capsuleInitB;

            this.capsuleCollision = new CapsuleCollision(this.capsuleCollisionInitialA, this.capsuleCollisionInitialB, 1);
            this.currentTransformation = initialTransformation;


        }

        setCapsuleCollisionTransformation(transformation) {
            this.capsuleCollision.a = transformation.times(this.capsuleCollisionInitialA);
            this.capsuleCollision.b = transformation.times(this.capsuleCollisionInitialB);
            this.root = transformation.times(Vec.of(0, 0, 0, 1));
        }
    };




function pointDistance(a, b) {
    d = a.minus(b);
    return d.norm();
}


//compute the minimum distance between two capsule collision and return whether the two
//capsule are collided. This implementation has better performance but not very precise.
function sphereTracePerformace(C0, C1) {

    a0 = C0.a.to3();
    b0 = C0.b.to3();
    a1 = C1.a.to3();
    b1 = C1.b.to3();

    r = C0.r + C1.r;
    w0 = a0.minus(a1);

    u = b0.minus(a0);
    v = b1.minus(a1);
    a = u.dot(u);
    b = u.dot(v);
    c = v.dot(v);
    d = u.dot(w0);
    e = v.dot(w0);
    s = (b * e - c * d) / (a * c - b * b);
    t = (a * e - b * d) / (a * c - b * b);


    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        distance = pointDistance(a0.plus(u.times(s)), a1.plus(v.times(t)));

        return (distance < r);
    }
    else {
        distance = Math.min(pointDistance(a0, a1), pointDistance(a0, b1), pointDistance(b0, a1), pointDistance(b0, b1));

        return (distance < r);
    }
}

//this implementation is perfect precise in math but costs performance
function sphereTracePrecise(C0, C1) {
}


//load the vertex positions, vertex normals, and vertex indices from a txt file which is converted from an obj file
function loadOBJModel(filepath) {
    var request = new XMLHttpRequest();
    request.open("GET", filepath, false);
    request.send(null);


    var data = request.responseText;
    var v = [];
    var vn = [];
    var indices = [];
    var vt = [];
    var lines = data.split('\n');


    var i;
    for (i = 0; i < lines.length; i++) {
        var lineContext = lines[i].split(' ');
        if (lineContext[0] == "v") {
            v.push(Vec.of(parseFloat(lineContext[1]), parseFloat(lineContext[2]), parseFloat(lineContext[3])));
        }
        else if (lineContext[0] == "vn") {
            var normal = Vec.of(parseFloat(lineContext[1]), parseFloat(lineContext[2]), parseFloat(lineContext[3]));
            vn.push(normal);
        }
        else if (lineContext[0] == "f") {
            indices.push(parseInt((lineContext[1].split('\\'))[0]) - 1);
            indices.push(parseInt((lineContext[2].split('\\'))[0]) - 1);
            indices.push(parseInt((lineContext[3].split('\\'))[0]) - 1);
        }
    }

    return [v, vn, indices];
}


function loadVertices(filepath) {
    var request = new XMLHttpRequest();
    request.open("GET", filepath, false);
    request.send(null);


    var data = request.responseText;
    var lines = data.split('\n');

    var positions = [];
    var boneWeights = [];
    var boneIDs = [];


    var i;
    for (i = 0; i < lines.length; i++) {
        var vertex = lines[i].split('@');

        var position = vertex[0].split(',');
        positions.push(Vec.of(parseFloat(position[0]), (parseFloat(position[1])), (parseFloat(position[2]))));

        var boneWeight = vertex[1].split(',');
        boneWeights.push(Vec.of(parseFloat(boneWeight[0]), parseFloat(boneWeight[1]), parseFloat(boneWeight[2]), parseFloat(boneWeight[3])));

        var boneID = vertex[2].split(',');
        boneIDs.push(Vec.of(parseInt(boneID[0]), parseInt(boneID[1]), parseInt(boneID[2]), parseInt(boneID[3])));
    }

    return [positions, boneWeights, boneIDs];
}

function loadIndices(filepath) {
    var request = new XMLHttpRequest();
    request.open("GET", filepath, false);
    request.send(null);


    var data = request.responseText;
    var lines = data.split('\n');
    var indices = [];


    var i;
    for (i = 0; i < lines.length; i++) {
        indices.push(parseInt(lines[i]));
    }

    return indices;
}


class KeyFrame {
    constructor(time = 0, boneT = 0) {
        this.time = time;
        this.boneT = boneT;
    }
}


function extractMatrix(string) {
    var col1 = Vec.of(parseFloat(string[0]), parseFloat(string[1]), parseFloat(string[2]), parseFloat(string[3]));
    var col2 = Vec.of(parseFloat(string[4]), parseFloat(string[5]), parseFloat(string[6]), parseFloat(string[7]));
    var col3 = Vec.of(parseFloat(string[8]), parseFloat(string[9]), parseFloat(string[10]), parseFloat(string[11]));
    var col4 = Vec.of(parseFloat(string[12]), parseFloat(string[13]), parseFloat(string[14]), parseFloat(string[15]));
    return new Mat4(col1, col2, col3, col4);
}

function extractFrame(frame) {
    var boneT = [];
    for (var i = 1; i < frame.length; i++) {
        boneT.push(extractMatrix(frame[i].split(',')));
    }
    return boneT;
}

function loadAnimation(filepath) {

    var request = new XMLHttpRequest();
    request.open("GET", filepath, false);
    request.send(null);


    var data = request.responseText;
    var lines = data.split('\n');
    var animation = [];


    var i;
    for (i = 0; i < lines.length; i++) {
        var frame = new KeyFrame();
        var thisFrameData = lines[i].split('@');
        frame.time = parseFloat(thisFrameData[0]);
        frame.boneT = extractFrame(thisFrameData);
        animation.push(frame);
    }

    return animation;



}


//math representation of capsule, which is simply two end points and a radius.
class CapsuleCollision {
    //a represents start point, b represents end point, c represents radius
    constructor(a, b, r) {
        this.a = a;
        this.b = b;
        this.r = r;
    }
}

//an actor is defined to be something that will be rendered on screen
class Actor extends Shape {
    constructor(vertices, normals, indices, material, boneWeights, boneID, rootTransformation, initialLocation = Vec.of(0, 0, 0, 1)) {
        //mesh information
        super("positions", "normals", "m_boneWeights", "m_boneID");
        this.positions = vertices;
        this.normals = normals;
        this.indices = indices;
        this.m_boneWeights = boneWeights;
        this.m_boneID = boneID;
        this.material = material;


        //transformation information, all actors has zero rotation and identity scale when spawn,
        //but initial location can be arbitrary
        this.rootTransformation = rootTransformation;

        this.localFrameX = Vec.of(1, 0, 0, 0);
        this.localFrameY = Vec.of(0, 1, 0, 0);
        this.localFrameZ = Vec.of(0, 0, 1, 0);
        this.actorLocation = initialLocation;
        this.scale = Vec.of(1, 1, 1);

        this.ownedComponents = [];
    }

    getActorLocation() {
        return this.actorLocation;
    }

    //suppose the actor face the negative z axis 
    getForwardVector() {
        return this.localFrameZ.times(-1);
    }

    getRightwardVector() {
        return this.localFrameX;
    }

    getUpwardVector() {
        return this.localFrameY;
    }

    //rotate in local frame should be operated for only x,y,or z axis,
    //local rotation with arbitrary axis is not implemented
    rotateActorLocal(axis, angle) {
        var rotationAxis = null;
        switch (axis) {
            case 'x':
                rotationAxis = this.localFrameX;
                var rotationMatrix = Mat4.rotation(angle, rotationAxis);
                this.localFrameY = rotationMatrix.times(this.localFrameY);
                this.localFrameZ = rotationMatrix.times(this.localFrameZ);
                break;

            case 'y':
                rotationAxis = this.localFrameY;
                var rotationMatrix = Mat4.rotation(angle, rotationAxis);
                this.localFrameX = rotationMatrix.times(this.localFrameX);
                this.localFrameZ = rotationMatrix.times(this.localFrameZ);
                break;

            case 'z':
                rotationAxis = this.localFrameZ;
                var rotationMatrix = Mat4.rotation(angle, rotationAxis);
                this.localFrameX = rotationMatrix.times(this.localFrameX);
                this.localFrameY = rotationMatrix.times(this.localFrameY);
                break;
            default:
                break;
        }

        if (!rotationAxis) {
            console.log("axis must be one of x or y or z");
        }

    }

    //to be implemented
    rotateActorWorld() {

    }

    //get the actor's world transformation, which can be used in draw call
    getActorTransformation() {
        return new Mat(this.localFrameX, this.localFrameY, this.localFrameZ, this.actorLocation).transposed().times(this.rootTransformation);
    }


    //set actor's location without checking collision, may cause collision problem
    setActorLocation(location) {
        this.actorLocation = location;
    }

    //move the actor in an arbitrary direction with arbitrary amount without checking collision, 
    //make cause collision problem. Direction is in world frame.
    moveActorInDirectionWorld(direction, amount) {
        var direction = direction.normalized().to4(0);
        this.actorLocation = this.actorLocation.plus(direction.times(amount));
    }

    //direction is in local frame
    moveActorInDirectionLocal() {

    }

    //propagate modification in transformation to all actor component owned by this actor
    setComponentLocalFrame() {

    }

}


class AnimationShader extends Shader {
    material() {
        return { shader: this }
    }

    map_attribute_name_to_buffer_name(name)        // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                              // names.  Map those names onto the arrays we'll pull them from.  This determines
        // which kinds of Shapes this Shader is compatible with.  Thanks to this function,
        // Vertex buffers in the GPU can get their pointers matched up with pointers to
        // attribute names in the GPU.  Shapes and Shaders can still be compatible even
        // if some vertex data feilds are unused.
        return { object_space_pos: "positions", color: "colors", boneWeights: "m_boneWeights", boneID: "m_boneID" }[name];      // Use a simple lookup table.
    }

    // Define how to synchronize our JavaScript's variables to the GPU's:
    update_GPU(g_state, model_transform, material, boneT, gpu = this.g_addrs, gl = this.gl) {
        const [P, C, M] = [g_state.projection_transform, g_state.camera_transform, model_transform], PCM = P.times(C).times(M);
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform_loc, false, Mat.flatten_2D_to_1D(PCM.transposed()));
        gl.uniformMatrix4fv(gpu.boneTransformations_loc, false, Mat.flatten_2D_to_1D(boneT));
    }

    shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    {
        return `precision mediump float;
              varying vec4 VERTEX_COLOR;
      `;
    }

    vertex_glsl_code()           // ********* VERTEX SHADER *********
    {
        return `
        attribute vec4 boneWeights;
        attribute vec4 boneID;
        //attribute vec4 color;
        attribute vec3 object_space_pos;
    
        uniform mat4 boneTransformations[100];

        uniform mat4 projection_camera_model_transform;

        void main()
        { 
          mat4 boneT = boneWeights[0] * boneTransformations[int(boneID[0])] + boneWeights[1] * boneTransformations[int(boneID[1])] + boneWeights[2] * boneTransformations[int(boneID[2])] + boneWeights[3] * boneTransformations[int(boneID[3])];
          gl_Position = projection_camera_model_transform * boneT * vec4(object_space_pos, 1.0);      // The vertex's final resting place (in NDCS).
          
          VERTEX_COLOR = vec4(1,0,0,1);                                                               // Use the hard-coded color of the vertex.
        }`;
    }

    fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    {
        return `
        void main()
        { gl_FragColor = VERTEX_COLOR;                                    // The interpolation gets done directly on the per-vertex colors.
        }`;
    }
}


//constructor(vertices, normals, indices, material, initialLocation=Vec.of(0,0,0,1))
class ElementSword extends Actor {
    constructor(material, initialLocation = Vec.of(0, 0, 0, 1)) {

        //mesh information
        var data = loadOBJModel("assets/ElementSword.txt");
        var vertices = data[0];
        var vertexNormals = data[1];
        var indices = data[2];
        var boneWeights = [];
        var boneID = [];
        /*
        for(let i = 0; i < vertices.length; i++)
        {
            boneWeights.push(Vec.of(1,0,0,0));
            boneID.push(Vec.of(1,0,0,0));
        }*/


        // vertices, normals, indices, material, boneWeights, boneID, initialLocation=Vec.of(0,0,0,1)
        super(vertices, vertexNormals, indices, material, boneWeights, boneID, Mat4.rotation(-Math.PI / 2, Vec.of(1, 0, 0)), initialLocation);


        //assign capsule collision with length roughly equals to length of sword 
        //and radius 20
        this.capsuleCollision = new CapsuleCollision(Vec.of(0, 0, 0, 1), Vec.of(0, 15, 150, 1), 20);
    }

    /*
        draw( graphics_state, model_transform, material, boneT, type = "TRIANGLES", gl = this.gl )        // To appear onscreen, a shape of any variety
        { 
          if( !this.gl ) throw "This shape's arrays are not copied over to graphics card yet.";  // goes through this draw() function, which
          material.shader.activate();                                                            // executes the shader programs.  The shaders
          material.shader.update_GPU( graphics_state, model_transform, material, boneT );               // draw the right shape due to pre-selecting
                                                                                                 // the correct buffer region in the GPU that
          for( let [ attr_name, attribute ] of Object.entries( material.shader.g_addrs.shader_attributes ) )  // holds that shape's data.
          { 
            
            
            const buffer_name = material.shader.map_attribute_name_to_buffer_name( attr_name );
     
    
            if( !buffer_name || !attribute.enabled )
              { if( attribute.index >= 0 ) gl.disableVertexAttribArray( attribute.index );
                continue;
              }
            gl.enableVertexAttribArray( attribute.index );
            gl.bindBuffer( gl.ARRAY_BUFFER, this.array_names_mapping_to_WebGLBuffers[ buffer_name ] ); // Activate the correct buffer.
           
            gl.vertexAttribPointer( attribute.index, attribute.size, attribute.type,                   // Populate each attribute 
                                    attribute.normalized, attribute.stride, attribute.pointer );       // from the active buffer.
          }
          this.execute_shaders( gl, type );                                                // Run the shaders to draw every triangle now.
        }    */


}


class Hornet extends Actor {
    constructor(material, initialLocation = Vec.of(0, 0, 0, 1)) {

        //mesh information
        var data = loadVertices("assets/hornetVertices.txt");
        var vertices = data[0];
        //var boneWeights = [];
        //var boneID = [];
        var boneWeights = data[1];
        var boneID = data[2];

        var vertexNormals = [];

        var indices = loadIndices("assets/hornetIndices.txt");



        // vertices, normals, indices, material, boneWeights, boneID, initialLocation=Vec.of(0,0,0,1)
        super(vertices, vertexNormals, indices, material, boneWeights, boneID, Mat4.rotation(-Math.PI / 2, Vec.of(1, 0, 0)), initialLocation);
        //super(vertices, vertexNormals, indices, material, boneWeights, boneID, Mat4.identity() ,initialLocation);

        //assign capsule collision with length roughly equals to length of sword 
        //and radius 20
        this.capsuleCollision = new CapsuleCollision(Vec.of(0, 0, 0, 1), Vec.of(0, 15, 150, 1), 20);
    }


    draw(graphics_state, model_transform, material, boneT, type = "TRIANGLES", gl = this.gl)        // To appear onscreen, a shape of any variety
    {
        if (!this.gl) throw "This shape's arrays are not copied over to graphics card yet.";  // goes through this draw() function, which
        material.shader.activate();                                                            // executes the shader programs.  The shaders
        material.shader.update_GPU(graphics_state, model_transform, material, boneT);               // draw the right shape due to pre-selecting
        // the correct buffer region in the GPU that
        for (let [attr_name, attribute] of Object.entries(material.shader.g_addrs.shader_attributes))  // holds that shape's data.
        {


            const buffer_name = material.shader.map_attribute_name_to_buffer_name(attr_name);


            if (!buffer_name || !attribute.enabled) {
                if (attribute.index >= 0) gl.disableVertexAttribArray(attribute.index);
                continue;
            }
            gl.enableVertexAttribArray(attribute.index);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.array_names_mapping_to_WebGLBuffers[buffer_name]); // Activate the correct buffer.

            gl.vertexAttribPointer(attribute.index, attribute.size, attribute.type,                   // Populate each attribute 
                attribute.normalized, attribute.stride, attribute.pointer);       // from the active buffer.
        }
        this.execute_shaders(gl, type);                                                // Run the shaders to draw every triangle now.
    }


}



window.Xvolution = window.classes.Xvolution =
    class Xvolution extends Scene_Component {
        constructor(context, control_box) {

            // // The scene begins by requesting the camera, shapes, and materials it will need.
            // super(context, control_box);
            //
            // this.context = context;
            // // First, include a secondary Scene that provides movement controls:
            // if (!context.globals.has_controls)
            //     context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));
            //
            // const r = context.width / context.height;
            context.globals.graphics_state.camera_transform = Mat4.translation([0, -200, -300]);  // Locate the camera here (inverted matrix).
            // context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 10000);

            super(context, control_box);    // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            // context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(-800, 0, -100), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform); //assign the value of camera location to an variable

            const r = context.width / context.height; //(percpective transform parameter)
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000); //(projection transform)


            const shapes = {
                rect: new Square(),
                // tri: new tetrahedron(),
                box: new Cube(),
                sphere: new Subdivision_Sphere(4),
                // trapezoid: new Cube2(),
                fire_ball: new Subdivision_Sphere(2),
                plane : new Square(),


            }
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    phong: context.get_instance(Phong_Shader).material(Color.of(0, 191 / 255, 255 / 255, 1), { ambient: 1 }, { diffusivity: 0 }, { specularity: 1 }, { smoothness: 1 }),
                    phong_tail: context.get_instance(Phong_Shader).material(Color.of(192 / 255, 192 / 255, 192 / 255, 1), { ambient: 1 }, { diffusivity: 0 }, { specularity: 1 }, { smoothness: 1 }),
                    phong_fan: context.get_instance(Phong_Shader).material(Color.of(169 / 255, 169 / 255, 169 / 255, 1), { ambient: 1 }, { diffusivity: 0 }, { specularity: 1 }, { smoothness: 1 }),
                    phong_hel: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1 }, { diffusivity: 0 }, { specularity: 1 }, { smoothness: 1 }),
                    // phong_text: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, texture: context.get_instance("assets/TT_Cliff.jpg", false) }),
                    // ground_material: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, texture: context.get_instance("assets/floor2.png", false) }),
                    back_ground: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 0.8, diffusivity:0.8,  texture: context.get_instance("assets/background.jpg", false) }),
                    // tree_material: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, texture: context.get_instance("assets/TT_Green Grass.BMP", false) }),
                    // fire_material: context.get_instance(fire_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, texture: context.get_instance("assets/flame.png", false) }, { diffusivity: 0 }, { specularity: 1 }, { smoothness: 1 }),
                    // smoke_material: context.get_instance(Smoke_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, texture: context.get_instance("assets/explosion.png", false) }, { diffusivity: 0 }, { specularity: 1 }, { smoothness: 1 }),
                    //
                    start_screen: context.get_instance(Fake_Bump_Map).material(Color.of(0, 0, 0, 1), {
                        ambient: 1,
                        diffusivity: 1,
                        specularity: 1,
                        texture: context.get_instance("assets/start.jpg", false)
                    }),

                    texture_ft: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1, texture: context.get_instance("assets/sp2_ft.png", false)}),
                    texture_bk: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1, texture: context.get_instance("assets/sp2_bk.png", false)}),
                    texture_up: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1, texture: context.get_instance("assets/sp2_up.png", false)}),
                    texture_dn: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1, texture: context.get_instance("assets/sp2_dn.png", false)}),
                    texture_rt: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1, texture: context.get_instance("assets/sp2_rt.png", false)}),
                    texture_lf: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1, texture: context.get_instance("assets/sp2_lf.png", false)}),


                };




            this.start = true;
            this.sign_Matrix = Mat4.identity().times(Mat4.scale([10, 10, 10])).times(Mat4.translation([0, 0, 100]));
            this.begin = false;




            this.animation = loadAnimation("assets/hornetNormalAttackOne.txt");
            this.textures =
            {
                star: new Texture(context.gl, "assets/stars.png", false)
            }

            // Make some Material objects available to you:
            this.clay = context.get_instance(Phong_Shader).material(Color.of(1.0, .5, .1, 1),
                {
                    ambient: .4,
                    diffusivity: .4,
                    texture: this.textures.star
                });


            this.plastic = context.get_instance(Phong_Shader).material(Color.of(0.0, 1.0, 0.0, 1),
                {
                    ambient: .4,
                    diffusivity: .4,
                });


            this.blue = context.get_instance(Phong_Shader).material(Color.of(0.2, 0.2, 1, 1),
                {
                    ambient: .4,
                    diffusivity: .4,
                });


            this.lights = [new Light(Vec.of(0, 5, 5, 1), Color.of(1, .4, 1, 1), 100000)];
            this.speed = 1;

            this.shader = context.get_instance(AnimationShader);
            this.anim = context.get_instance(AnimationShader).material();

            this.actors =
            {
                sword: new ElementSword(this.plastic),
                //enemy: new Cube(Vec.of(0,1.2,0,1), Vec.of(0,-1.2,0,1), Mat4.translation([0,0,-15]).times(Mat4.scale([1,10,1]))),
                capsuleNotify: new Subdivision_Sphere(4),
                //skybox: new Cube(Vec.of(0,0,0,1), Vec.of(0,0,0,1), Mat4.scale([100,100,100])),
                hornet: new Hornet(this.shader.material())

            };

            this.submit_shapes(context, this.actors);
            this.animationStartTime = 0.0;
            this.playAnimation = true;
            this.moveSign = 1;
            this.swordSocketTransformation = Mat4.translation([0, 2, 0]).times(Mat4.rotation(-0.2, Vec.of(0, 1, 0))).times(Mat4.rotation(0.2, Vec.of(1, 0, 0))).times(Mat4.translation([-5, 5, 0])).times(Mat4.rotation(0.8, Vec.of(0, 0, 1))).times(Mat4.translation([0, 0, -5])).times(Mat4.translation([10, 0, 0])).times(Mat4.translation([0, -5, 0])).times(Mat4.translation([0, 0, -10])).times(Mat4.translation([-20, 0, 0]));
            this.attached = () =>  this.initial_camera_location;
        }

        make_control_panel() {

            this.key_triggered_button("playAnimation", ["0"], () => {
                this.playAnimation = !this.playAnimation;
            });

            this.key_triggered_button("Start", ['n'], () => {
                this.begin = true;
            });


            /*
            this.key_triggered_button("rotateSwordX", ["1"], () =>
            {
                this.actors.sword.rotateActorLocal('x', this.moveSign * 0.2);
            });   

            this.key_triggered_button("rotateSwordY", ["2"], () =>
            {
                this.actors.sword.rotateActorLocal('y',this.moveSign * 0.2);
                
            });

            this.key_triggered_button("rotateSwordZ", ["3"], () => 
            {
                this.actors.sword.rotateActorLocal('z',this.moveSign * 0.2);
            });

            this.key_triggered_button("moveSwordAlongLocalX", ["4"], () => 
            {
                this.actors.sword.moveActorInDirectionWorld(this.actors.sword.localFrameX, this.moveSign *10);
            });

            this.key_triggered_button("moveSwordAlongLocalY", ["5"], () => 
            {
                this.actors.sword.moveActorInDirectionWorld(this.actors.sword.localFrameY, this.moveSign *10);
            });

            this.key_triggered_button("moveSwordAlongLocalZ", ["6"], () => 
            {
                this.actors.sword.moveActorInDirectionWorld(this.actors.sword.localFrameZ, this.moveSign *10);
            });

            this.key_triggered_button("change move sign", ["6"], () => 
            {
                this.moveSign = -1 * this.moveSign;
            });
*/

        }

        trigger_game(graphics_state) {
            graphics_state.camera_transform = Mat4.translation([0, -200, -300]);
            // graphics_state.camera_transform = Mat4.translation(Vec.of(0, 0, -30)).times(Mat4.rotation(-Math.PI / 3, Vec.of(1, 0, 0))).times(Mat4.scale([3 / 2, 3 / 2, 3 / 2]));
            this.start = false;
            this.begin = false;
        }


        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

            if (this.start) {
                graphics_state.camera_transform = Mat4.look_at(Vec.of(0, -5, 1030), Vec.of(0, 100, 0), Vec.of(0, 10, 0));
                let sign_Matrix = this.sign_Matrix.times(Mat4.rotation(Math.PI / 36, Vec.of(1, 0, 0))).times(Mat4.scale([3/2, 3/2, 3/2]));
                this.shapes.plane.draw(graphics_state, sign_Matrix, this.materials.start_screen);
                if (this.begin) {
                    this.trigger_game(graphics_state);
                }
            }


            let currentTime = graphics_state.animation_time / 1000;

            var animationTime = currentTime - this.animationStartTime;

            if (animationTime > 1.85) {
                this.animationStartTime = currentTime;
                animationTime = 0;
            }


            var i = 0;
            for (i = 0; i < this.animation.length - 1; i++) {
                if (animationTime < this.animation[i].time) {
                    break;
                }
            }

            var boneT = (this.animation)[i].boneT;

            if (!this.playAnimation) {
                boneT = this.animation[0].boneT;
            }

            var boneTFlatten = [];
            for (var i = 0; i < boneT.length; i++) {
                boneTFlatten.push(Mat.flatten_2D_to_1D(boneT[i]));
            }

            var magiccol1 = Vec.of(0.687476608, -0.614557829, 0.387225151, 0);
            var magiccol2 = Vec.of(0.442205787, -0.0688173175, -0.894269764, 0);
            var magiccol3 = Vec.of(0.576049268, 0.786020994, 0.224362388, 0);
            var magiccol4 = Vec.of(-25.5383663, -122.560478, -2.82226348, 1);
            var magic = new Mat4(magiccol1, magiccol2, magiccol3, magiccol4).transposed();

            let hornet_transformation = Mat4.identity().times(this.actors.hornet.getActorTransformation());
            hornet_transformation = hornet_transformation.times(Mat4.translation([-250, 250, 0]));

            this.actors.hornet.draw(graphics_state, hornet_transformation, this.actors.hornet.material, boneTFlatten);
            this.actors.sword.draw(graphics_state, hornet_transformation.times(boneT[32].transposed()).times(Mat4.inverse(magic)).times(this.swordSocketTransformation), this.actors.sword.material);


            let ground_position = Mat4.identity();
            let backGround = Mat4.identity();
            backGround = backGround.times(Mat4.translation([0, 200, -300]).times(Mat4.scale([450, 250, 0])));


            // ground_position = ground_position.times(Mat4.rotation(0.5 * Math.PI, Vec.of(1, 0, 0))).times(Mat4.scale([200, 200, 0]));
            // ground_position = ground_position.times(Mat4.translation([0, 0, -300]).times(Mat4.scale([100, 100, 0])));
            // this.shapes.rect.draw(graphics_state, ground_position, this.materials.ground_material);

            this.shapes.rect.draw(graphics_state, backGround, this.materials.back_ground);









            //var handT = this.actors.hornet.getActorTransformation().times(boneT[32].transposed()).times(Mat4.inverse(magic));

            // this.actors.capsuleNotify.draw(graphics_state, handT.times(Mat4.scale([10,10,10])), this.plastic);


            /*
            var X = Vec.of(0.033068221789769536, -0.05806200722639715, -0.9977640295382963, 0);
            var Y = Vec.of(-0.9407896495241211, 0.33479602682382553, -0.05080029415808579, 0);
            var Z = Vec.of(0.3369660844805484, 0.9405091079540194, -0.04356189987134512, 0);
            var O = Vec.of(-21.12128071468601, 95.82134031607694, 44.61229690497418, 1);

            this.actors.capsuleNotify.draw(graphics_state, Mat4.translation(O).times(Mat4.scale([5,5,5])), this.plastic);
            this.actors.capsuleNotify.draw(graphics_state, Mat4.translation(O.plus(X.times(20))).times(Mat4.scale([5,5,5])), this.plastic);
            this.actors.capsuleNotify.draw(graphics_state, Mat4.translation(O.plus(Y.times(20))).times(Mat4.scale([5,5,5])), this.blue);

            this.actors.capsuleNotify.draw(graphics_state, Mat4.translation(O.plus(Z.times(20))).times(Mat4.scale([5,5,5])), this.clay);
*/

            /*
 [0.033068221789769536, -0.9407896495241211, 0.3369660844805484, -21.12128071468601]
1: (4) [-0.05806200722639715, 0.33479602682382553, 0.9405091079540194, 95.82134031607694]
2: (4) [-0.9977640295382963, -0.05080029415808579, -0.04356189987134512, 44.61229690497418]
3: (4) [0, 0, 0, 1]*/
            //let swordTransformation = Mat4.identity().times(Mat4.scale([10,1,1]));

            //Mat4.translation(Vec.of(92, -76, 53))
            //let swordTransformation = Mat4.rotation(Math.abs(2*Math.PI*Math.sin(0.2*Math.PI*t)), Vec.of(1,0,0));
            //this.shapes.sword.setCapsuleCollisionTransformation(swordTransformation);

            //this.shapes.sword.draw(graphics_state, swordTransformation, this.plastic);


            //this.shapes.capsuleNotify.draw(graphics_state, Mat4.identity(), this.clay);
            //this.shapes.capsuleNotify.draw(graphics_state, Mat4.translation([0, 15, 150]), this.clay);
            /*
 
             let direction = (this.shapes.sword.root).minus(this.shapes.enemy.root).to3();
             if(direction.norm()>0.001)
             {
                 direction.normalize();
             }
 
        
 
             let enemyTransformation = Mat4.translation(direction.times(this.speed).times(t).times(0.01)).times(this.shapes.enemy.currentTransformation);
 
             this.shapes.enemy.currentTransformation = enemyTransformation;
             this.shapes.enemy.setCapsuleCollisionTransformation(enemyTransformation);
 
 
             
 
             this.shapes.enemy.draw(graphics_state, enemyTransformation, this.plastic);
 
 
 
         
             this.shapes.capsuleNotify.draw(graphics_state, Mat4.translation(this.shapes.sword.capsuleCollision.a.to3()), this.clay);
             this.shapes.capsuleNotify.draw(graphics_state, Mat4.translation(this.shapes.sword.capsuleCollision.b.to3()), this.clay);
             this.shapes.capsuleNotify.draw(graphics_state, Mat4.translation(this.shapes.enemy.capsuleCollision.a.to3()), this.clay);
             this.shapes.capsuleNotify.draw(graphics_state, Mat4.translation(this.shapes.enemy.capsuleCollision.b.to3()), this.clay);
 
 
             
             if(sphereTracePerformace(this.shapes.sword.capsuleCollision, this.shapes.enemy.capsuleCollision))
             {
                 this.speed = -this.speed;
             }
             
             if(this.speed < 0 && t%3 < 0.1)
             {
                 this.speed = -this.speed;
             }
 
             this.shapes.skybox.draw(graphics_state, this.shapes.skybox.currentTransformation, this.blue);
            
         */
        }
    };
