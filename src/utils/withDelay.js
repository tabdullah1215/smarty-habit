// src/utils/withDelay.js
// export const withMinimumDelay = async (operation, minimumDelay = 2000) => {
//     const startTime = Date.now();
//     const result = await operation();
//     const elapsedTime = Date.now() - startTime;
//
//     if (elapsedTime < minimumDelay) {
//         await new Promise(resolve => setTimeout(resolve, minimumDelay - elapsedTime));
//     }
//
//     return result;
// };

export const withMinimumDelay = async (operation, minimumDelay = 1000) => {
    // First, wait for the minimum delay
    await new Promise((resolve) => setTimeout(resolve, minimumDelay));

    // Then, execute the operation
    return operation();
};
