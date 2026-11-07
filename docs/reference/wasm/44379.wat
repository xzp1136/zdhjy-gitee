  (func (;44379;) (type 9) (param i32 i32 i32 i32 i32) (result i32)
    (local i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4367395
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3345368
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3428276
      call 2180
      i32.const 3367752
      call 2180
      i32.const 4367395
      i32.const 1
      i32.store8
    end
    i32.const 3367752
    i32.load
    call 1900
    local.tee 4
    local.get 1
    i32.store offset=12
    local.get 4
    local.get 0
    i32.store offset=8
    i32.const 3360788
    i32.load
    local.tee 6
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 6
      call 60460
    end
    i32.const 0
    local.set 6
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 4
      i32.load offset=12
      local.get 0
      i32.load offset=56
      local.get 4
      i32.const 16
      i32.add
      local.get 4
      i32.const 20
      i32.add
      i32.const 0
      call 43417
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      if  ;; label = @2
        i32.const 4367476
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3361216
          call 2180
          i32.const 4367476
          i32.const 1
          i32.store8
        end
        i32.const 1
        local.set 6
        i32.const 3361216
        i32.load
        i32.load offset=92
        i32.load
        local.tee 1
        i32.eqz
        br_if 1 (;@1;)
        local.get 5
        i32.const 16
        i32.add
        local.get 0
        i32.const 0
        call 48735
        i32.const 0
        call 49468
        local.get 4
        i32.load offset=16
        local.set 0
        i32.const 3345368
        i32.load
        call 1900
        local.tee 2
        local.get 4
        i32.const 3428276
        i32.load
        i32.const 0
        call 44658
        local.get 5
        local.get 5
        i32.load offset=24
        i32.store offset=8
        local.get 5
        local.get 5
        i64.load offset=16
        i64.store
        local.get 1
        local.get 5
        local.get 0
        local.get 3
        local.get 2
        i32.const 0
        call 43553
        br 1 (;@1;)
      end
      local.get 0
      local.get 4
      i32.load offset=12
      local.get 4
      i32.load offset=16
      local.get 4
      i32.load offset=20
      local.get 4
      call 44289
      i32.const 1
      local.set 6
    end
    local.get 5
    i32.const 32
    i32.add
    global.set 0
    local.get 6)
