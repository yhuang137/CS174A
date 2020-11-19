window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
    class Assignment_Three_Scene extends Scene_Component {
        constructor(context, control_box)
        {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                torus: new Torus(15, 15),
                torus2: new (Torus.prototype.make_flat_shaded_version())(15, 15),
                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                //        (Requirement 1)
                sun: new Subdivision_Sphere(4),
                planet1: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
                planet2: new Subdivision_Sphere(3),
                planet3: new Subdivision_Sphere(4),
                planet4: new Subdivision_Sphere(4),
                moon: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(1),

            };
            this.submit_shapes(context, shapes);



            // Make some Material objects available to you:
            this.materials =
                {
                    test: context.get_instance(Phong_Shader).material(Color.of(1, 1, 0, 1), {ambient: .2}),
                    ring: context.get_instance(Ring_Shader).material(),

                    // TODO:  Fill in as many additional material objects as needed in this key/value table.
                    //        (Requirement 1)
                    sun: context.get_instance(Phong_Shader).material(Color.of(1, 0, 1, 1), {ambient:  1}),
                    planet1: context.get_instance(Phong_Shader).material(Color.of(190/255, 195/255, 198/255, 1), {ambient: 0, diffusivity: 1,   specular: 0}),
                    planet2: context.get_instance(Phong_Shader).material(Color.of(128/255, 168/255,  22/255, 1), {ambient: 0, diffusivity: 0.3, specular: 1}),
                    planet3: context.get_instance(Phong_Shader).material(Color.of(128/255,  88/255,  65/255, 1), {ambient: 0, diffusivity: 1,   specular: 1}),
                    planet4: context.get_instance(Phong_Shader).material(Color.of(30/255, 40/255, 130/255, 1), {ambient: 0, specular: 0.8}),
                    moon: context.get_instance(Phong_Shader).material(Color.of(1/255, 50/255,  32/255, 1), {ambient: 0}),
                };

            this.lights = [new Light(Vec.of(5, -10, 5, 1), Color.of(0, 1, 1, 1), 1000)];
            this.attached = () =>  Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View solar system", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("Attach to planet 1", ["1"], () => this.attached = () => this.planet_1);
            this.key_triggered_button("Attach to planet 2", ["2"], () => this.attached = () => this.planet_2);
            this.new_line();
            this.key_triggered_button("Attach to planet 3", ["3"], () => this.attached = () => this.planet_3);
            this.key_triggered_button("Attach to planet 4", ["4"], () => this.attached = () => this.planet_4);
            this.new_line();
            this.key_triggered_button("Attach to planet 5", ["5"], () => this.attached = () => this.planet_5);
            this.key_triggered_button("Attach to moon", ["m"], () => this.attached = () => this.moon);
        }

        first_person_flyaround(){}

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


            // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
            let pi = Math.PI;
            let yAxis = Vec.of(0, 1, 0);

            // Sun
            let x = 0.4 * pi * t;
            var radius_x = Math.sin(x) + 2;
            let temp = 0.5 * Math.sin(x);
            let sunColor = Color.of(0.5 + temp, 0, 0.5 - temp, 1);
            this.lights = [new Light(Vec.of(0, 0, 0, 1), sunColor, 10**radius_x)];
            let sun_transformation = Mat4.identity();
            sun_transformation = sun_transformation.times(Mat4.scale([radius_x, radius_x, radius_x]));
            this.shapes.sun.draw(graphics_state, sun_transformation, this.materials.sun.override({color: sunColor}));

            // Planet1
            let planet1_transformation = Mat4.identity();
            planet1_transformation = planet1_transformation.times(Mat4.rotation(t, yAxis));
            planet1_transformation = planet1_transformation.times(Mat4.translation([5, 0, 0]));
            planet1_transformation = planet1_transformation.times(Mat4.rotation(2*t, yAxis));
            this.shapes.planet1.draw(graphics_state, planet1_transformation, this.materials.planet1);

            // Planet2
            let planet2_transformation = Mat4.identity();
            planet2_transformation = planet2_transformation.times(Mat4.rotation(0.8*t, yAxis));
            planet2_transformation = planet2_transformation.times(Mat4.translation([8, 0, 0]));
            planet2_transformation = planet2_transformation.times(Mat4.rotation(1.8*t, yAxis));
            this.shapes.planet2.draw(graphics_state, planet2_transformation, this.materials.planet2.override({gouraud: (t%2 == 1)}));

            // Planet3
            let planet3_transformation = Mat4.identity();
            planet3_transformation = planet3_transformation.times(Mat4.rotation(0.6*t, yAxis));
            planet3_transformation = planet3_transformation.times(Mat4.translation([11, 0, 0]));
            planet3_transformation = planet3_transformation.times(Mat4.rotation(1.6*t, Vec.of(0, 1, 1)));
            let ring_transformation = planet3_transformation;
            ring_transformation = ring_transformation.times(Mat4.scale([1, 1, 0.01]));
            this.shapes.planet3.draw(graphics_state, planet3_transformation, this.materials.planet3);
            this.shapes.torus2.draw(graphics_state, ring_transformation, this.materials.ring);

            // Planet 4
            let planet4_transformation = Mat4.identity();
            planet4_transformation = planet4_transformation.times(Mat4.rotation(0.4*t, yAxis));
            planet4_transformation = planet4_transformation.times(Mat4.translation([14, 0 , 0]));
            planet4_transformation = planet4_transformation.times(Mat4.rotation(1.4*t, yAxis));
            this.shapes.planet4.draw(graphics_state, planet4_transformation, this.materials.planet4);

            // Moon
            let moon_transformation = planet4_transformation;
            moon_transformation = moon_transformation.times(Mat4.rotation(-1.4*t, yAxis));
            moon_transformation = moon_transformation.times(Mat4.rotation(0.9*t, yAxis));
            moon_transformation = moon_transformation.times(Mat4.translation([2, 0, 0]));
            this.shapes.moon.draw(graphics_state, moon_transformation, this.materials.moon);

            this.planet_1 = planet1_transformation;
            this.planet_2 = planet2_transformation;
            this.planet_3 = planet3_transformation;
            this.planet_4 = planet4_transformation;
            this.moon = moon_transformation;
            let cameraMatrix = this.attached();

            switch (cameraMatrix)
            {
                case this.initial_camera_location:
                    graphics_state.camera_transform = Mat4.inverse(cameraMatrix).map((x, i) => Vec.from(graphics_state.camera_transform[i]).mix( x, 0.1));
                    break;

                case this.planet_1:
                case this.planet_2:
                case this.planet_3:
                case this.planet_4:
                case this.moon:
                    let camera_transformation = Mat4.translation([0, 0, -5]).times(Mat4.inverse(cameraMatrix));
                    graphics_state.camera_transform = camera_transformation.map((x, i) => Vec.from(graphics_state.camera_transform[i]).mix( x, 0.1));
                    break;
            }

        }
    };


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
    class Ring_Shader extends Shader {
        // Subclasses of Shader each store and manage a complete GPU program.
        material() {
            // Materials here are minimal, without any settings.
            return {shader: this}
        }

        map_attribute_name_to_buffer_name(name) {
            // The shader will pull single entries out of the vertex arrays, by their data fields'
            // names.  Map those names onto the arrays we'll pull them from.  This determines
            // which kinds of Shapes this Shader is compatible with.  Thanks to this function,
            // Vertex buffers in the GPU can get their pointers matched up with pointers to
            // attribute names in the GPU.  Shapes and Shaders can still be compatible even
            // if some vertex data feilds are unused.
            return {object_space_pos: "positions"}[name];      // Use a simple lookup table.
        }

        // Define how to synchronize our JavaScript's variables to the GPU's:
        update_GPU(g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl) {
            const proj_camera = g_state.projection_transform.times(g_state.camera_transform);
            // Send our matrices to the shader programs:
            gl.uniformMatrix4fv(gpu.model_transform_loc, false, Mat.flatten_2D_to_1D(model_transform.transposed()));
            gl.uniformMatrix4fv(gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(proj_camera.transposed()));
        }

        shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        {
            return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
        }

        vertex_glsl_code()           // ********* VERTEX SHADER *********
        {
            return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
            center = vec4(0, 0, 0, 1);
            position = vec4(object_space_pos, 1);
            gl_Position = projection_camera_transform * model_transform * position;
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        }

        fragment_glsl_code()           // ********* FRAGMENT SHADER *********
        {
            return `
        void main()
        { 
            float temp = sin(20.0 * distance(center, position));
            gl_FragColor = temp * vec4(128/255,  88/255,  65/255, 1);
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        }
    };

window.Grid_Sphere = window.classes.Grid_Sphere =
    class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at
    {
        constructor(rows, columns, texture_range)             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
        {
            super("positions", "normals", "texture_coords");
            // TODO:  Complete the specification of a sphere with lattitude and longitude lines
            //        (Extra Credit Part III)
        }
    };