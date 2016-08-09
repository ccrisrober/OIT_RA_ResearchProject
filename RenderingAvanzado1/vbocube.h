#ifndef VBOCUBE_H
#define VBOCUBE_H

#include <GL/glew.h>

class VBOCube { 
private:
    unsigned int VAO;
    unsigned int handle[4];
public:
    VBOCube(float size = 1.0f);

    void render();

	~VBOCube() {
		for(int i = 0; i < 4; i++) {
			glDeleteBuffers(1, &handle[i]);
		}
		glDeleteVertexArrays(1, &VAO);
	}
	// TODO: Hay que liberar recursos ...
};

#endif // VBOCUBE_H
