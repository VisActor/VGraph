#include <graphviz/gvc.h>
#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>

extern gvplugin_library_t gvplugin_core_LTX_library;
extern gvplugin_library_t gvplugin_dot_layout_LTX_library;

lt_symlist_t lt_preloaded_symbols[] = {
    {"gvplugin_core_LTX_library", &gvplugin_core_LTX_library},
    {"gvplugin_dot_layout_LTX_library", &gvplugin_dot_layout_LTX_library},
    {0, 0}};

EM_JS(int, viz_errorf, (char *text), {
    Module["agerrMessages"].push(UTF8ToString(text));
    return 0;
});

EMSCRIPTEN_KEEPALIVE
Agraph_t *viz_read_one_graph(char *string)
{
    Agraph_t *graph = NULL;
    Agraph_t *other_graph = NULL;

    // Reset errors

    agseterrf(viz_errorf);
    agseterr(AGWARN);
    agreseterrors();

    // Try to read one graph

    graph = agmemread(string);

    // Consume the rest of the input

    do
    {
        other_graph = agmemread(NULL);
        if (other_graph)
        {
            agclose(other_graph);
        }
    } while (other_graph);

    return graph;
}

EMSCRIPTEN_KEEPALIVE
char *layout(char *string)
{
    GVC_t *gvc = gvContextPlugins(lt_preloaded_symbols, 0);
    char *data = NULL;
    unsigned int length = 0;
    Agraph_t *g;
    g = viz_read_one_graph(string);
    gvLayout(gvc, g, "dot");
    // Output in plain format
    gvRenderData(gvc, g, "plain", &data, &length);
    gvFreeLayout(gvc, g);
    agclose(g);

    return data;
}