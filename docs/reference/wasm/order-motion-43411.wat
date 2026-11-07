  (func (;43411;) (type 2) (param i32 i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366727
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3390824
      call 2180
      i32.const 3388532
      call 2180
      i32.const 3390828
      call 2180
      i32.const 3435552
      call 2180
      i32.const 4366727
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=20
      local.tee 3
      local.get 0
      i32.load offset=32
      local.tee 4
      i32.load offset=12
      i32.ge_s
      if  ;; label = @2
        i32.const 3356428
        i32.load
        local.tee 3
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 3
          call 60460
        end
        i32.const 3435552
        i32.load
        i32.const 0
        call 55817
        local.get 0
        i32.load offset=16
        local.get 1
        local.get 2
        i32.const 4
        i32.add
        i32.const 3388532
        i32.load
        call 50458
        local.get 2
        i32.load offset=4
        local.tee 0
        i32.eqz
        br_if 1 (;@1;)
        local.get 0
        i32.const 0
        i32.store8 offset=129
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
        i32.const 3361216
        i32.load
        i32.load offset=92
        i32.load
        local.tee 0
        i32.eqz
        br_if 1 (;@1;)
        local.get 0
        local.get 0
        call 43412
        br 1 (;@1;)
      end
      local.get 4
      local.get 3
      local.get 2
      i32.const 8
      i32.add
      i32.const 3390828
      i32.load
      call 50458
      local.get 2
      i32.load offset=8
      local.set 3
      local.get 0
      i32.load offset=16
      local.get 1
      local.get 2
      i32.const 12
      i32.add
      i32.const 3388532
      i32.load
      call 50458
      local.get 2
      i32.load offset=12
      local.get 3
      f32.const 0x1.47ae14p-8 (;=0.005;)
      local.get 0
      call 43400
      local.get 0
      local.get 0
      i32.load offset=20
      i32.const 1
      i32.add
      i32.store offset=20
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0)
