#include "Camera.h"

#include <GL\glew.h>
#include <GLFW/glfw3.h>
#include <stdlib.h>
#include <stdio.h>
#include "glm/glm.hpp"
#include "glm/gtc/matrix_transform.hpp"
#include "glm/gtc/constants.hpp"
#include "glm/gtc/type_ptr.hpp"
#include <iostream>

#include "SimpleGLShader.h"
#include "vbocube.h"

std::vector<glm::vec4> colors;

enum KeyState {
	KEY_RELEASED,
	KEY_PRESSED,
	KEY_REPEAT
};
enum BufferNames {
	COUNTER_BUFFER = 0,
	LINKED_LIST_BUFFER
};
SimpleGLShader prog;
GLuint maxNodes;
int width, height;
GLuint buffers[2], fsQuad, headPtrTex;
GLuint pass1Index, pass2Index;
GLuint clearBuf;

VBOCube *cube;

mat4 model;
mat4 view;
mat4 projection;
float angle, tPrev, rotSpeed;

Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
void setMatrices() {
	mat4 mv = view * model;
	prog.send_uniform("normalMatrix", mat3( vec3(mv[0]), vec3(mv[1]), vec3(mv[2]) ) );
	prog.send_uniform("modelView", mv);
	prog.send_uniform("modelViewProj", projection * mv);
}

#define MIN -1
#define MAX 1
int count = 0;

void drawScene() {
	int n = 0;
	int m = -1;
	static float angle = 0;
	angle += 1;
	count = 0;	//17576
	float size = 5.0f;
	for( int i = MIN; i <= MAX; i++ ) {
		if(i % 2 == 1) continue;
		for( int j = MIN; j <= MAX; j++ ) {
			if(j % 2 == 1) continue;
			for( int k = MIN; k <= MAX; k++ ) {
				if(k % 2 == 1) continue;
				//if( (i + j + k) % 2 == 0 ) {
					glEnable(GL_CULL_FACE);
					m *= -1;
					count++;
					prog.send_uniform("Kd", colors[n++ % colors.size()] );
					model = glm::translate(mat4(1.0f), vec3(3 + 5*i, -3 + 5*j, 3 + 5*k));
					model = glm::rotate(model, glm::radians(angle)+i+j+1+k, vec3(0.0, 1.0, 1.0));
					model = glm::scale( model, vec3(size) );
					setMatrices();
					cube->render();
				//}
			}
		}
	}
	// count = 2197
}
void initShaderStorage() {
	glGenBuffers(2, buffers);
	maxNodes = 20 * width * height;
	GLint nodeSize = 5 * sizeof(GLfloat) + 1 * sizeof(GLuint); // The size of a linked list node

	// Our atomic counter
	glBindBufferBase(GL_ATOMIC_COUNTER_BUFFER, 0, buffers[COUNTER_BUFFER]);
	glBufferData(GL_ATOMIC_COUNTER_BUFFER, sizeof(GLuint), NULL, GL_DYNAMIC_DRAW);

	// The buffer for the head pointers, as an image texture
	glGenTextures(1, &headPtrTex);
	glBindTexture(GL_TEXTURE_2D, headPtrTex);
	glTexStorage2D(GL_TEXTURE_2D, 1, GL_R32UI, width, height);
	glBindImageTexture(0, headPtrTex, 0, GL_FALSE, 0, GL_READ_WRITE, GL_R32UI);

	// The buffer of linked lists
	//glBindBuffer(GL_SHADER_STORAGE_BUFFER, buffers[LINKED_LIST_BUFFER]);
	glBindBufferBase(GL_SHADER_STORAGE_BUFFER, 0, buffers[LINKED_LIST_BUFFER]);
	glBufferData(GL_SHADER_STORAGE_BUFFER, maxNodes * nodeSize, NULL, GL_DYNAMIC_DRAW);

	std::vector<GLuint> headPtrClearBuf(width*height, 0xffffffff);
	glGenBuffers(1, &clearBuf);
	glBindBuffer(GL_PIXEL_UNPACK_BUFFER, clearBuf);
	glBufferData(GL_PIXEL_UNPACK_BUFFER, headPtrClearBuf.size() * sizeof(GLuint), &headPtrClearBuf[0], GL_DYNAMIC_DRAW);
	glBindBuffer(GL_PIXEL_UNPACK_BUFFER, 0);
}
double t0 = 0.0;
int frames = 0;
char titlestring[200];
GLFWwindow* window;
void showFPS() {

    double t, fps;
    
    // Get current time
    t = glfwGetTime();  // Get number of seconds since glfwInit()
    // Calculate and display FPS (frames per second) in title bar.
    if( (t-t0) > 1.0 || frames == 0 )
    {
        fps = (double)frames / (t-t0);
        sprintf(titlestring, "Planet system (%.1f FPS)", fps);
		glfwSetWindowTitle(window, titlestring);
        t0 = t;
        frames = 0;
    }
    frames ++;
}

void pass1() {
	// Reset atomic counter
	GLuint zero = 0;
	glBindBufferBase(GL_ATOMIC_COUNTER_BUFFER, 0, buffers[COUNTER_BUFFER] );
	glBufferSubData(GL_ATOMIC_COUNTER_BUFFER, 0, sizeof(GLuint), &zero);
	//glClearBufferData(GL_ATOMIC_COUNTER_BUFFER, GL_R32UI, GL_RED, GL_UNSIGNED_INT, &zero);

	// Reset head points by coping the clear buffer into the texture
	glBindBuffer(GL_PIXEL_UNPACK_BUFFER, clearBuf);

	glBindTexture(GL_TEXTURE_2D, headPtrTex);
	glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, width, height, GL_RED_INTEGER, GL_UNSIGNED_INT, 0);
	glBindTexture(GL_TEXTURE_2D, 0);

	glBindBuffer(GL_PIXEL_UNPACK_BUFFER, 0);
	

	glUniformSubroutinesuiv( GL_FRAGMENT_SHADER, 1, &pass1Index);
	prog.send_uniform("maxNodes", maxNodes);

	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	view = camera.GetViewMatrix();

	projection = camera.GetProjectionMatrix();

	glDepthMask( GL_FALSE );

	// draw scene
	drawScene();

	glFinish();
}
void pass2();
//https://github.com/McNopper/OpenGL/blob/master/Example36/src/main.c
void clearBuffers();

// Function prototypes
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void window_size_callback(GLFWwindow* window, int width, int height);
void Do_Movement();

// Camera
KeyState keys[1024];
GLfloat lastX = 400, lastY = 300;
bool firstMouse = true;

GLfloat deltaTime = 0.0f;
GLfloat lastFrame = 0.0f;

bool isDraw = true;

void render() {
	if(!isDraw) {
		return;
	}
	prog.use();
	//clearBuffers();
	pass1();
	pass2();
	prog.unuse();
}
void initScene() {
	prog.load("oi.vert", "oi.frag");
	prog.link();
	prog.compile_and_link();
	
	prog.add_uniform("maxNodes");
	prog.add_uniform("normalMatrix");
	prog.add_uniform("modelView");
	prog.add_uniform("modelViewProj");
	prog.add_uniform("Kd");

	glClearColor(0.5f,0.5f,0.5f,1.0f);

	cube = new VBOCube();

	prog.use();
	initShaderStorage();
	prog.unuse();

	GLuint programHandle = prog.program();
	pass1Index = glGetSubroutineIndex( programHandle, GL_FRAGMENT_SHADER, "pass1");
	pass2Index = glGetSubroutineIndex( programHandle, GL_FRAGMENT_SHADER, "pass2");
	std::cout << pass1Index << " " << pass2Index << std::endl;
	// Set up a  VAO for the full-screen quad
	GLfloat verts[] = { 
		-1.0f, -1.0f, 0.0f, 
		1.0f, -1.0f, 0.0f,
		1.0f, 1.0f, 0.0f, 
		-1.0f, 1.0f, 0.0f 
	};
	GLuint bufHandle;
	glGenBuffers(1, &bufHandle);
	glBindBuffer(GL_ARRAY_BUFFER, bufHandle);
	glBufferData(GL_ARRAY_BUFFER, 4 * 3 * sizeof(GLfloat), verts, GL_STATIC_DRAW);

	// Set up the vertex array object
	glGenVertexArrays( 1, &fsQuad );
	glBindVertexArray(fsQuad);

	glBindBuffer(GL_ARRAY_BUFFER, bufHandle);
	glVertexAttribPointer( 0, 3, GL_FLOAT, GL_FALSE, 0, 0 );
	glEnableVertexAttribArray(0);  // Vertex position

	glBindVertexArray(0);

	for(int i = 0; i < 40; i++) {
		float r = ((float)( std::rand() % 1000)) * 0.001;
		float g = ((float)( std::rand() % 1000)) * 0.001;
		float b = ((float)( std::rand() % 1000)) * 0.001;
		float a = ((float)( std::rand() % 1000)) * 0.001;
		if(a >= 0.75) {
			a = 0.4;
		}
		colors.push_back(glm::vec4(r, g, b, a));
	}

	std::cout << "HP: " << glGetUniformLocation(programHandle, "headPointers") << std::endl;
	std::cout << "NNC: " << glGetUniformLocation(programHandle, "nextNodeCounter") << std::endl;
	std::cout << "L: " << glGetUniformLocation(programHandle, "lilit") << std::endl;
}

// The MAIN function, from here we start our application and run our Game loop
int main() {
	width = 1920*1/3;
	height = 1080*1/3;

    // Init GLFW
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    //glfwWindowHint(GLFW_RESIZABLE, GL_TRUE);
    glfwWindowHint(GLFW_SAMPLES, 4);	// Antialising: 4 samples

	window = glfwCreateWindow(width, height, "Rendering Avanzado", NULL, NULL);
    glfwMakeContextCurrent(window);

    // Set the required callback functions
    glfwSetKeyCallback(window, key_callback);
    glfwSetCursorPosCallback(window, mouse_callback);
    glfwSetScrollCallback(window, scroll_callback);
	glfwSetWindowSizeCallback(window, window_size_callback);

    // Options
    //glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
	//showCursor(window);

    // Initialize GLEW to setup the OpenGL Function pointers
    glewExperimental = GL_TRUE;
    glewInit();

    // Define the viewport dimensions
	window_size_callback(window, width, height);

    // Setup some OpenGL options
    glEnable(GL_DEPTH_TEST);

	glfwSwapInterval(1);


	initScene();

    // Game loop
	while(!glfwWindowShouldClose(window)) {
		glPolygonMode( GL_FRONT_AND_BACK, GL_FILL );
        // Set frame time
        GLfloat currentFrame = (GLfloat)glfwGetTime();
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;
		
        glfwPollEvents();
        Do_Movement();

		render();

		showFPS();

        // Swap the buffers
        glfwSwapBuffers(window);
    }
    // TODO: Clear data
	delete(cube);
	glBindBuffer(GL_ATOMIC_COUNTER_BUFFER, 0);
	glBindTexture(GL_TEXTURE_2D, 0);

	glBindBuffer(GL_PIXEL_UNPACK_BUFFER, 0);
	glDeleteBuffers(1, &clearBuf);
	glBindBuffer(GL_SHADER_STORAGE_BUFFER, 0);
	glDeleteBuffers(2, &buffers[0]);

	/*GLint total_mem_kb = 0;
	glGetIntegerv(GL_GPU_MEM_INFO_TOTAL_AVAILABLE_MEM_NVX, &total_mem_kb);
	std::cout << "TOTAL MEM: " << total_mem_kb << std::endl;
	GLint cur_avail_mem_kb = 0;
	glGetIntegerv(GL_GPU_MEM_INFO_CURRENT_AVAILABLE_MEM_NVX, &cur_avail_mem_kb);
	std::cout << "AVAIL MEM: " << cur_avail_mem_kb << std::endl;*/
    glfwTerminate();
    return 0;
}

// Based in SFML
bool isKeyPressed(GLuint key) {
	return keys[key] == KEY_PRESSED;
}

bool isKeyReleased(GLuint key) {
	return keys[key] == KEY_RELEASED;
}

bool isKeyRepeat(GLuint key) {
	return keys[key] == KEY_REPEAT;
}

float speed = 1.0f;
void Do_Movement() {
	speed = 1.0f;
	if(isKeyPressed(GLFW_KEY_LEFT_SHIFT))
		speed = 20.0f;
    // Camera controls
    if(isKeyPressed(GLFW_KEY_W)) {
        camera.ProcessKeyboard(FORWARD, speed * deltaTime);
	}
    if(isKeyPressed(GLFW_KEY_S)) {
        camera.ProcessKeyboard(BACKWARD, speed * deltaTime);
	}
    if(isKeyPressed(GLFW_KEY_A)) {
        camera.ProcessKeyboard(LEFT, speed * deltaTime);
	}
    if(isKeyPressed(GLFW_KEY_D)) {
        camera.ProcessKeyboard(RIGHT, speed * deltaTime);
	}
	if(isKeyPressed(GLFW_KEY_Q)) {
        camera.ProcessKeyboard(UP, speed * deltaTime);
	}
    if(isKeyPressed(GLFW_KEY_Z)) {
        camera.ProcessKeyboard(DOWN, speed * deltaTime);
	}
}

// Is called whenever a key is pressed/released via GLFW
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode) {
    if(key == GLFW_KEY_ESCAPE && action == GLFW_PRESS) {
        glfwSetWindowShouldClose(window, GL_TRUE);
	}
	
	if (action == GLFW_PRESS) {
		keys[key] = KEY_PRESSED;
	}
	if (action == GLFW_RELEASE) {
		keys[key] = KEY_RELEASED;
	}
}

void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{
    if(firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    GLfloat xoffset = xpos - lastX;
    GLfloat yoffset = lastY - ypos;  // Reversed since y-coordinates go from bottom to left
    
    lastX = xpos;
    lastY = ypos;

    camera.ProcessMouseMovement(xoffset, yoffset);
}	


void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    camera.ProcessMouseScroll(yoffset);
}
void clearBuffers() {
	GLuint zero = 0;
	glBindBufferBase(GL_ATOMIC_COUNTER_BUFFER, 0, buffers[COUNTER_BUFFER] );
	//glBufferSubData(GL_ATOMIC_COUNTER_BUFFER, 0, sizeof(GLuint), &zero);
	glClearBufferData(GL_ATOMIC_COUNTER_BUFFER, GL_R32UI, GL_RED, GL_UNSIGNED_INT, &zero);

	glBindBuffer(GL_PIXEL_UNPACK_BUFFER, clearBuf);
	glBindTexture(GL_TEXTURE_2D, headPtrTex);
	glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, width, height, GL_RED_INTEGER, GL_UNSIGNED_INT, NULL);
	glBindBuffer(GL_PIXEL_UNPACK_BUFFER, 0);
}
void pass2() {
	glMemoryBarrier( GL_SHADER_STORAGE_BARRIER_BIT );

	glUniformSubroutinesuiv( GL_FRAGMENT_SHADER, 1, &pass2Index);

	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	view = glm::mat4(1.0f);
	projection = glm::mat4(1.0f);
	model = glm::mat4(1.0f);

	setMatrices();

	// Draw a screen filler
	glBindVertexArray(fsQuad);
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glBindVertexArray(0);
}
void window_size_callback(GLFWwindow* window, int width_, int height_) {
	isDraw = false;
	if(width_ > width) {
		std::cout << "LOL";
	}
	width = width_;
	height = height_;
	glViewport(0, 0, width, height);
	{
		camera.screenHeight = height_;
		camera.screenWidth = width_;
	}
	maxNodes = 20 * width * height;
	std::cout << width << " - " << height << std::endl;

	isDraw = true;
}