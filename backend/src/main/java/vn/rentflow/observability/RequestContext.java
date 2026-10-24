package vn.rentflow.observability;

public final class RequestContext {

    private static final ThreadLocal<RequestContextData> CONTEXT = new ThreadLocal<>();

    private RequestContext() {
    }

    public static void init(String requestId, String clientIp) {
        CONTEXT.set(new RequestContextData(requestId, clientIp, System.currentTimeMillis()));
    }

    public static String getRequestId() {
        RequestContextData data = CONTEXT.get();
        return data != null ? data.requestId() : "N/A";
    }

    public static String getClientIp() {
        RequestContextData data = CONTEXT.get();
        return data != null ? data.clientIp() : "unknown";
    }

    public static long getStartTime() {
        RequestContextData data = CONTEXT.get();
        return data != null ? data.startTime() : System.currentTimeMillis();
    }

    public static void clear() {
        CONTEXT.remove();
    }

    private record RequestContextData(String requestId, String clientIp, long startTime) {
    }
}
