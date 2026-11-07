  (func (;43419;) (type 7) (param i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4366811
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3388632
      call 2180
      i32.const 3391532
      call 2180
      i32.const 3388636
      call 2180
      i32.const 3391536
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4366811
      i32.const 1
      i32.store8
    end
    local.get 4
    i32.const 0
    i32.store offset=24
    local.get 4
    i32.const 0
    i32.store offset=20
    local.get 4
    i32.const 0
    i32.store offset=16
    local.get 4
    i32.const 0
    i32.store offset=12
    i32.const 3360788
    i32.load
    local.tee 5
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 5
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 3
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      block  ;; label = @2
        local.get 0
        i32.load offset=48
        local.tee 6
        i32.load offset=12
        i32.const 0
        i32.le_s
        br_if 0 (;@2;)
        i32.const 0
        local.set 5
        loop  ;; label = @3
          local.get 6
          local.get 5
          local.get 4
          i32.const 28
          i32.add
          i32.const 3391536
          i32.load
          call 50458
          block  ;; label = @4
            local.get 4
            i32.load offset=28
            local.tee 6
            i32.eqz
            br_if 0 (;@4;)
            local.get 6
            i32.load offset=8
            local.set 7
            i32.const 3360788
            i32.load
            local.tee 10
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 10
              call 60460
            end
            local.get 7
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            local.get 6
            i32.load8_u offset=20
            br_if 0 (;@4;)
            local.get 6
            i32.load offset=12
            local.get 2
            i32.ne
            br_if 0 (;@4;)
            local.get 1
            local.get 2
            local.get 4
            i32.const 24
            i32.add
            local.get 4
            i32.const 20
            i32.add
            local.get 4
            call 43417
            i32.eqz
            br_if 2 (;@2;)
            local.get 6
            i32.const 1
            i32.store8 offset=20
            local.get 0
            local.get 6
            local.get 1
            local.get 4
            i32.load offset=24
            local.get 4
            i32.load offset=20
            local.get 9
            local.get 4
            call 43422
            local.get 9
            i32.const 1
            i32.add
            local.set 9
            local.get 8
            i32.const 1
            i32.add
            local.set 8
          end
          local.get 5
          i32.const 1
          i32.add
          local.tee 5
          local.get 0
          i32.load offset=48
          local.tee 6
          i32.load offset=12
          i32.ge_s
          br_if 1 (;@2;)
          local.get 3
          local.get 8
          i32.gt_s
          br_if 0 (;@3;)
        end
      end
      local.get 0
      i32.load offset=32
      local.tee 5
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 3
      local.get 8
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 6
      loop  ;; label = @2
        local.get 5
        local.get 6
        local.get 4
        i32.const 28
        i32.add
        i32.const 3388636
        i32.load
        call 50458
        local.get 4
        i32.load offset=28
        local.set 5
        i32.const 3360788
        i32.load
        local.tee 7
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 7
          call 60460
        end
        block  ;; label = @3
          local.get 5
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          i32.const 4366842
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3360788
            call 2180
            i32.const 4366842
            i32.const 1
            i32.store8
          end
          local.get 5
          i32.load8_u offset=84
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.load8_u offset=85
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.load8_u offset=52
          br_if 0 (;@3;)
          local.get 5
          i32.load offset=40
          local.get 2
          i32.ne
          br_if 0 (;@3;)
          local.get 5
          i32.load offset=44
          local.set 7
          i32.const 3360788
          i32.load
          local.tee 10
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 10
            call 60460
          end
          local.get 7
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 5
          i32.const 1
          i32.store8 offset=52
          local.get 5
          i32.load offset=44
          local.set 7
          local.get 1
          local.get 2
          local.get 4
          i32.const 16
          i32.add
          local.get 4
          i32.const 12
          i32.add
          local.get 4
          call 43417
          i32.eqz
          if  ;; label = @4
            local.get 5
            i32.const 0
            i32.store8 offset=52
            br 3 (;@1;)
          end
          local.get 0
          local.get 5
          local.get 7
          local.get 1
          local.get 4
          i32.load offset=16
          local.get 2
          local.get 4
          i32.load offset=12
          local.get 9
          local.get 4
          call 43423
          local.get 9
          i32.const 1
          i32.add
          local.set 9
          local.get 8
          i32.const 1
          i32.add
          local.set 8
        end
        local.get 6
        i32.const 1
        i32.add
        local.tee 6
        local.get 0
        i32.load offset=32
        local.tee 5
        i32.load offset=12
        i32.ge_s
        br_if 1 (;@1;)
        local.get 3
        local.get 8
        i32.gt_s
        br_if 0 (;@2;)
      end
    end
    local.get 4
    i32.const 32
    i32.add
    global.set 0)
